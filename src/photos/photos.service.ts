import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { access } from 'node:fs/promises';
import { basename, resolve, sep } from 'node:path';
import { Repository } from 'typeorm';
import { EXCLUDED_PHOTO_TAG } from '../config/calendar.constants';
import { AppConfiguration } from '../config/configuration';
import { Photo } from './entities/photo.entity';

@Injectable()
export class PhotosService {
  constructor(
    @InjectRepository(Photo)
    private readonly photoRepository: Repository<Photo>,
    private readonly configService: ConfigService<AppConfiguration, true>,
  ) {}

  /** Pool des photos éligibles au tirage (celles taguées `exclude` sont écartées). */
  async getSelectablePhotoIds(): Promise<number[]> {
    const photos = await this.photoRepository.find({ order: { id: 'ASC' } });
    return photos
      .filter((photo) => !photo.tags?.includes(EXCLUDED_PHOTO_TAG))
      .map((photo) => photo.id);
  }

  /**
   * Résout le chemin absolu d'une photo autorisée.
   * Triple contrôle : l'id doit exister en base, le fichier doit rester dans PHOTOS_PATH
   * (défense en profondeur contre le path traversal) et être réellement présent sur le disque.
   */
  async resolvePhotoPath(id: number): Promise<string> {
    const photo = await this.photoRepository.findOne({ where: { id } });

    if (!photo) {
      throw new NotFoundException(`Photo ${id} introuvable.`);
    }

    const root = this.configService.get('photos', { infer: true }).path;
    const absolutePath = resolve(root, basename(photo.filename));

    if (!absolutePath.startsWith(root + sep)) {
      throw new NotFoundException(`Photo ${id} introuvable.`);
    }

    try {
      await access(absolutePath);
    } catch {
      throw new NotFoundException(`Fichier manquant pour la photo ${id}.`);
    }

    return absolutePath;
  }
}
