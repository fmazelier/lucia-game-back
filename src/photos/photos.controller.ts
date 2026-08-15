import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  /**
   * GET /photos/:id
   * Sert l'image binaire, protégée par le JWT global : aucune photo n'est accessible
   * publiquement. Le front doit la récupérer en blob (HttpClient) pour pouvoir
   * transmettre l'en-tête Authorization, puis créer une object URL.
   * 404 si l'id n'appartient pas au pool autorisé.
   */
  @Get(':id')
  async serve(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ): Promise<void> {
    const absolutePath = await this.photosService.resolvePhotoPath(id);

    // Réponse privée : mise en cache navigateur autorisée, jamais par un proxy partagé.
    response.setHeader('Cache-Control', 'private, max-age=604800, immutable');
    response.sendFile(absolutePath);
  }
}
