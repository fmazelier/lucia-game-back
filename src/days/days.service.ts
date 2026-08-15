import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { currentDateInTimeZone } from '../common/utils/date.util';
import { shuffle } from '../common/utils/random.util';
import {
  CALENDAR_END_DATE,
  CALENDAR_START_DATE,
  PHOTO_COOLDOWN_DAYS,
} from '../config/calendar.constants';
import { AppConfiguration } from '../config/configuration';
import { PhotosService } from '../photos/photos.service';
import {
  DayConfigResponse,
  DayStatusResponse,
  DaySummaryResponse,
  RewardResponse,
} from './dto/day-response.dto';
import { Day } from './entities/day.entity';

@Injectable()
export class DaysService {
  constructor(
    @InjectRepository(Day) private readonly dayRepository: Repository<Day>,
    private readonly photosService: PhotosService,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  /**
   * Date du jour calculée exclusivement côté serveur, dans le fuseau configuré.
   * Aucune date envoyée par le client n'est prise en compte pour déterminer « aujourd'hui ».
   */
  getCurrentDate(): string {
    return currentDateInTimeZone(
      this.configService.get('timezone', { infer: true }),
    );
  }

  /** Config du jour courant, avec tirage paresseux des photos à la première consultation. */
  getTodayConfig(): Promise<DayConfigResponse> {
    return this.getDayConfig(this.getCurrentDate());
  }

  /** Config d'un jour donné : un jour manqué reste rattrapable tant que le calendrier est ouvert. */
  async getDayConfig(date: string): Promise<DayConfigResponse> {
    this.assertCalendarIsOpen(this.getCurrentDate());
    this.assertDayIsReachable(date);

    const day = await this.ensurePhotoDraw(await this.findDayOrFail(date));

    return {
      date: day.date,
      dayIndex: day.dayIndex,
      difficultyLevel: day.difficultyLevel,
      pairsCount: day.difficultyLevel,
      cardsCount: day.difficultyLevel * 2,
      grid: { rows: day.gridRows, cols: day.gridCols },
      // Ordre stocké figé en base, mais remélangé à chaque réponse.
      photoIds: shuffle(day.photoIds ?? []),
      completed: day.completed,
      completedAt: day.completedAt?.toISOString() ?? null,
    };
  }

  /** Marque un jour comme complété. Idempotent : un second appel ne change rien. */
  async completeDay(date: string): Promise<DayStatusResponse> {
    const day = await this.findDayOrFail(date);

    this.assertDayIsReachable(date);

    let justCompleted = false;

    if (!day.completed) {
      day.completed = true;
      day.completedAt = new Date();
      await this.dayRepository.save(day);
      justCompleted = true;
    }

    return {
      date: day.date,
      completed: day.completed,
      completedAt: day.completedAt?.toISOString() ?? null,
      justCompleted,
    };
  }

  /** Récompense d'un jour, accessible uniquement une fois le memory terminé. */
  async getReward(date: string): Promise<RewardResponse> {
    const day = await this.findDayOrFail(date);

    if (!day.completed) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'DAY_NOT_COMPLETED',
        message: 'Termine le jeu du jour pour débloquer ta récompense.',
        date,
      });
    }

    return {
      date: day.date,
      rewardType: day.rewardType,
      rewardContent: DaysService.parseRewardContent(day.rewardContent),
    };
  }

  /** Vue d'ensemble du calendrier (debug / admin), sans révéler les récompenses verrouillées. */
  async findAll(): Promise<DaySummaryResponse[]> {
    const days = await this.dayRepository.find({ order: { date: 'ASC' } });

    return days.map((day) => ({
      date: day.date,
      dayIndex: day.dayIndex,
      difficultyLevel: day.difficultyLevel,
      pairsCount: day.difficultyLevel,
      grid: { rows: day.gridRows, cols: day.gridCols },
      completed: day.completed,
      completedAt: day.completedAt?.toISOString() ?? null,
      photosDrawn: (day.photoIds?.length ?? 0) > 0,
      rewardType: day.completed ? day.rewardType : null,
    }));
  }

  /** Anti-triche : un jour futur reste inaccessible, même en manipulant l'horloge du client. */
  private assertDayIsReachable(date: string): void {
    if (date > this.getCurrentDate()) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'DAY_NOT_AVAILABLE_YET',
        message: "Ce jour n'est pas encore disponible.",
        date,
      });
    }
  }

  private assertCalendarIsOpen(today: string): void {
    if (today < CALENDAR_START_DATE) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'CALENDAR_NOT_STARTED',
        message: "Le calendrier n'a pas encore commencé, un peu de patience.",
        startDate: CALENDAR_START_DATE,
        endDate: CALENDAR_END_DATE,
      });
    }

    if (today > CALENDAR_END_DATE) {
      throw new ForbiddenException({
        statusCode: 403,
        code: 'CALENDAR_FINISHED',
        message: 'Le calendrier est terminé. À très vite !',
        startDate: CALENDAR_START_DATE,
        endDate: CALENDAR_END_DATE,
      });
    }
  }

  private async findDayOrFail(date: string): Promise<Day> {
    const day = await this.dayRepository.findOne({ where: { date } });

    if (!day) {
      throw new NotFoundException(
        `Aucun jour de calendrier pour la date ${date}.`,
      );
    }

    return day;
  }

  /**
   * Tire les photos du jour si ce n'est pas déjà fait, puis fige le résultat en base :
   * le plateau reste identique si le jeu est rechargé en cours de partie.
   */
  private async ensurePhotoDraw(day: Day): Promise<Day> {
    if (day.photoIds && day.photoIds.length >= day.difficultyLevel) {
      return day;
    }

    const pool = await this.photosService.getSelectablePhotoIds();

    if (pool.length < day.difficultyLevel) {
      throw new ServiceUnavailableException(
        `Pool de photos insuffisant : ${pool.length} disponible(s) pour ${day.difficultyLevel} paires requises.`,
      );
    }

    day.photoIds = this.drawPhotoIds(
      pool,
      day.difficultyLevel,
      await this.getRecentPhotoUsage(day.dayIndex),
    );
    await this.dayRepository.save(day);

    return day;
  }

  /** Dernier index de jour où chaque photo a été utilisée, sur la fenêtre de cooldown. */
  private async getRecentPhotoUsage(
    dayIndex: number,
  ): Promise<Map<number, number>> {
    const previousDays = await this.dayRepository.find({
      where: {
        dayIndex: Between(
          Math.max(1, dayIndex - PHOTO_COOLDOWN_DAYS),
          dayIndex - 1,
        ),
      },
    });

    const lastUsedByPhoto = new Map<number, number>();

    for (const previousDay of previousDays) {
      for (const photoId of previousDay.photoIds ?? []) {
        lastUsedByPhoto.set(
          photoId,
          Math.max(lastUsedByPhoto.get(photoId) ?? 0, previousDay.dayIndex),
        );
      }
    }

    return lastUsedByPhoto;
  }

  /**
   * Priorité absolue aux photos non vues sur les derniers jours.
   * Si le pool est trop petit pour l'éviter, on complète par les photos utilisées
   * le moins récemment (le tri est stable, l'ordre aléatoire départage les ex aequo).
   */
  private drawPhotoIds(
    pool: number[],
    count: number,
    lastUsedByPhoto: Map<number, number>,
  ): number[] {
    const unused = shuffle(pool.filter((id) => !lastUsedByPhoto.has(id)));

    if (unused.length >= count) {
      return unused.slice(0, count).sort((a, b) => a - b);
    }

    const recentlyUsed = shuffle(
      pool.filter((id) => lastUsedByPhoto.has(id)),
    ).sort(
      (a, b) => (lastUsedByPhoto.get(a) ?? 0) - (lastUsedByPhoto.get(b) ?? 0),
    );

    return [...unused, ...recentlyUsed].slice(0, count).sort((a, b) => a - b);
  }

  /** Les contenus structurés sont stockés en JSON (objet ou tableau) ; le reste est du texte brut. */
  private static parseRewardContent(content: string): unknown {
    const trimmed = content.trim();

    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return content;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return content;
    }
  }
}
