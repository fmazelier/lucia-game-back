import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import webpush, { WebPushError } from 'web-push';
import { currentDateInTimeZone } from '../common/utils/date.util';
import {
  CALENDAR_END_DATE,
  CALENDAR_START_DATE,
} from '../config/calendar.constants';
import { AppConfiguration } from '../config/configuration';
import { Day } from '../days/entities/day.entity';
import { SubscribeDto } from './dto/subscribe.dto';
import { PushSubscription } from './entities/push-subscription.entity';

interface NotificationPayload {
  title: string;
  body: string;
  /** Route ouverte au clic sur la notification. */
  url: string;
  tag: string;
}

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private enabled = false;

  constructor(
    @InjectRepository(PushSubscription)
    private readonly subscriptions: Repository<PushSubscription>,
    @InjectRepository(Day)
    private readonly days: Repository<Day>,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  onModuleInit(): void {
    const push = this.configService.get('push', { infer: true });

    if (!push.vapidPublicKey || !push.vapidPrivateKey) {
      this.logger.warn(
        'Clés VAPID absentes : les notifications push sont désactivées.',
      );
      return;
    }

    webpush.setVapidDetails(
      push.vapidSubject,
      push.vapidPublicKey,
      push.vapidPrivateKey,
    );
    this.enabled = true;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getPublicKey(): string {
    return this.configService.get('push', { infer: true }).vapidPublicKey;
  }

  /** Idempotent : réabonner le même appareil met simplement à jour ses clés. */
  async subscribe(dto: SubscribeDto): Promise<void> {
    await this.subscriptions.save({
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
    });
  }

  async unsubscribe(endpoint: string): Promise<void> {
    await this.subscriptions.delete({ endpoint });
  }

  async sendTest(): Promise<number> {
    return this.broadcast({
      title: 'Notifications activées ❤️',
      body: 'Tu recevras un petit rappel chaque jour.',
      url: '/',
      tag: 'test',
    });
  }

  /**
   * Rappel quotidien : silencieux si le calendrier est fermé ou si le jour est déjà fait.
   * Le contenu ne dévoile jamais la récompense, la notification étant visible écran verrouillé.
   */
  async sendDailyReminder(): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    const today = currentDateInTimeZone(
      this.configService.get('timezone', { infer: true }),
    );
    if (today < CALENDAR_START_DATE || today > CALENDAR_END_DATE) {
      return 0;
    }

    const day = await this.days.findOne({ where: { date: today } });
    if (!day || day.completed) {
      return 0;
    }

    return this.broadcast({
      title: 'Ta carte du jour t’attend',
      body: `Jour ${day.dayIndex} — une nouvelle surprise à débloquer.`,
      url: '/game',
      tag: `reminder-${today}`,
    });
  }

  private async broadcast(payload: NotificationPayload): Promise<number> {
    if (!this.enabled) {
      return 0;
    }

    const targets = await this.subscriptions.find();
    if (targets.length === 0) {
      return 0;
    }

    const body = JSON.stringify(payload);
    const stale: string[] = [];
    let sent = 0;

    await Promise.all(
      targets.map(async (target) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: target.endpoint,
              keys: { p256dh: target.p256dh, auth: target.auth },
            },
            body,
            // Un rappel « du jour » n'a plus de sens le lendemain.
            { TTL: 6 * 3600, urgency: 'normal' },
          );
          sent += 1;
        } catch (error) {
          if (
            error instanceof WebPushError &&
            (error.statusCode === 404 || error.statusCode === 410)
          ) {
            stale.push(target.endpoint);
            return;
          }
          this.logger.error(
            `Échec d'envoi push : ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }),
    );

    if (stale.length > 0) {
      await this.subscriptions.delete({ endpoint: In(stale) });
      this.logger.log(`${stale.length} abonnement(s) expiré(s) supprimé(s).`);
    }

    return sent;
  }
}
