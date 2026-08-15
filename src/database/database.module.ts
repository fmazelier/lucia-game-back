import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { AppConfiguration } from '../config/configuration';
import { Day } from '../days/entities/day.entity';
import { Photo } from '../photos/entities/photo.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<AppConfiguration, true>,
      ) => {
        const databasePath = configService.get('database', {
          infer: true,
        }).path;
        // Le dossier ./data est un volume monté au runtime : il peut être vide au premier démarrage.
        await mkdir(dirname(databasePath), { recursive: true });

        return {
          type: 'better-sqlite3' as const,
          database: databasePath,
          entities: [Day, Photo],
          // Schéma trivial et mono-utilisateur : la synchronisation automatique suffit.
          synchronize: true,
        };
      },
    }),
    TypeOrmModule.forFeature([Day, Photo]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
