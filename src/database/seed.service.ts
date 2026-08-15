import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir, readdir } from 'node:fs/promises';
import { extname } from 'node:path';
import { In, Repository } from 'typeorm';
import { enumerateDates } from '../common/utils/date.util';
import {
  ALLOWED_PHOTO_EXTENSIONS,
  CALENDAR_END_DATE,
  CALENDAR_START_DATE,
  getDifficultyTier,
} from '../config/calendar.constants';
import { AppConfiguration } from '../config/configuration';
import { Day } from '../days/entities/day.entity';
import { Photo } from '../photos/entities/photo.entity';
import { REWARDS_SEED } from './rewards.seed';

/** Fichiers de type `12.webp` : l'id de la photo est le nom du fichier. */
const PHOTO_FILENAME_PATTERN = /^(\d+)$/;

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Day) private readonly dayRepository: Repository<Day>,
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.configService.get('autoSeed', { infer: true })) {
      await this.run();
    }
  }

  /** Seed complet et idempotent : peut être rejoué à chaque démarrage sans effet de bord. */
  async run(): Promise<void> {
    await this.syncPhotos();
    await this.seedDays();
  }

  /**
   * Aligne la table `photos` sur le contenu réel du dossier PHOTOS_PATH.
   * Ajouter une photo = déposer `19.webp` dans le dossier puis redémarrer.
   */
  private async syncPhotos(): Promise<void> {
    const photosPath = this.configService.get('photos', { infer: true }).path;
    await mkdir(photosPath, { recursive: true });

    const entries = await readdir(photosPath, { withFileTypes: true });
    const filesOnDisk = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) =>
        (ALLOWED_PHOTO_EXTENSIONS as readonly string[]).includes(
          extname(name).toLowerCase(),
        ),
      )
      .map((name) => ({
        name,
        match: PHOTO_FILENAME_PATTERN.exec(
          name.slice(0, -extname(name).length),
        ),
      }))
      .filter(
        (file): file is { name: string; match: RegExpExecArray } =>
          file.match !== null,
      )
      .map((file) => ({
        id: Number.parseInt(file.match[1], 10),
        filename: file.name,
      }));

    if (filesOnDisk.length === 0) {
      this.logger.warn(
        `Aucune photo trouvée dans ${photosPath} (fichiers attendus : 1.webp, 2.webp, ...).`,
      );
      return;
    }

    const existing = await this.photoRepository.find({
      where: { id: In(filesOnDisk.map((file) => file.id)) },
    });
    const existingById = new Map(existing.map((photo) => [photo.id, photo]));

    const toInsert = filesOnDisk
      .filter((file) => !existingById.has(file.id))
      .map((file) =>
        this.photoRepository.create({
          id: file.id,
          filename: file.filename,
          tags: [],
        }),
      );

    if (toInsert.length > 0) {
      await this.photoRepository.save(toInsert);
    }

    // Les tags posés à la main en base sont préservés : seul le nom de fichier est resynchronisé.
    const renamed = filesOnDisk.filter((file) => {
      const photo = existingById.get(file.id);
      return photo !== undefined && photo.filename !== file.filename;
    });

    for (const file of renamed) {
      await this.photoRepository.update(
        { id: file.id },
        { filename: file.filename },
      );
    }

    const orphans = await this.photoRepository
      .createQueryBuilder('photo')
      .where('photo.id NOT IN (:...ids)', {
        ids: filesOnDisk.map((file) => file.id),
      })
      .getMany();

    if (orphans.length > 0) {
      this.logger.warn(
        `Photos référencées en base mais absentes du disque : ${orphans.map((photo) => photo.filename).join(', ')}`,
      );
    }

    this.logger.log(
      `Photos synchronisées : ${filesOnDisk.length} fichier(s), ${toInsert.length} ajout(s).`,
    );
  }

  /**
   * Crée les lignes Day manquantes sur toute la plage du calendrier,
   * avec la difficulté du palier et la récompense du catalogue.
   * Les photos ne sont PAS tirées ici : le tirage est paresseux (première consultation).
   */
  private async seedDays(): Promise<void> {
    const dates = enumerateDates(CALENDAR_START_DATE, CALENDAR_END_DATE);
    const existingDays = await this.dayRepository.find();
    const existingByDate = new Map(existingDays.map((day) => [day.date, day]));

    const toCreate: Day[] = [];
    const toRealign: Day[] = [];

    dates.forEach((date, index) => {
      const dayIndex = index + 1;
      const tier = getDifficultyTier(dayIndex);
      const existing = existingByDate.get(date);

      if (!existing) {
        const reward = REWARDS_SEED[index % REWARDS_SEED.length];
        toCreate.push(
          this.dayRepository.create({
            date,
            dayIndex,
            difficultyLevel: tier.pairs,
            gridRows: tier.rows,
            gridCols: tier.cols,
            photoIds: null,
            completed: false,
            completedAt: null,
            rewardType: reward.type,
            rewardContent: reward.content,
          }),
        );
        return;
      }

      // Un palier modifié après coup n'est répercuté que sur les jours pas encore tirés.
      const needsRealign =
        existing.photoIds === null &&
        (existing.dayIndex !== dayIndex ||
          existing.difficultyLevel !== tier.pairs ||
          existing.gridRows !== tier.rows ||
          existing.gridCols !== tier.cols);

      if (needsRealign) {
        existing.dayIndex = dayIndex;
        existing.difficultyLevel = tier.pairs;
        existing.gridRows = tier.rows;
        existing.gridCols = tier.cols;
        toRealign.push(existing);
      }
    });

    if (toCreate.length > 0) {
      await this.dayRepository.save(toCreate);
    }
    if (toRealign.length > 0) {
      await this.dayRepository.save(toRealign);
    }

    this.logger.log(
      `Calendrier ${CALENDAR_START_DATE} → ${CALENDAR_END_DATE} : ${dates.length} jour(s), ` +
        `${toCreate.length} créé(s), ${toRealign.length} réaligné(s).`,
    );
  }
}
