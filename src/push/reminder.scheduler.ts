import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AppConfiguration } from '../config/configuration';
import { PushService } from './push.service';

const JOB_NAME = 'daily-reminder';

/**
 * Le décorateur `@Cron` n'accepte qu'une expression statique :
 * l'horaire venant de la configuration, le job est enregistré à la main.
 */
@Injectable()
export class ReminderScheduler implements OnModuleInit {
  private readonly logger = new Logger(ReminderScheduler.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly pushService: PushService,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  onModuleInit(): void {
    if (!this.pushService.isEnabled()) {
      return;
    }

    const cronTime = this.configService.get('push', {
      infer: true,
    }).reminderCron;
    const timeZone = this.configService.get('timezone', { infer: true });

    const job = CronJob.from({
      cronTime,
      timeZone,
      onTick: () => {
        void this.run();
      },
    });

    this.schedulerRegistry.addCronJob(JOB_NAME, job);
    job.start();
    this.logger.log(`Rappel quotidien planifié (${cronTime}, ${timeZone}).`);
  }

  private async run(): Promise<void> {
    try {
      const sent = await this.pushService.sendDailyReminder();
      this.logger.log(`Rappel quotidien envoyé à ${sent} appareil(s).`);
    } catch (error) {
      this.logger.error(
        `Rappel quotidien en échec : ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
