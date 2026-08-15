import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed.service';

/**
 * Seed manuel : `npm run seed`.
 * Le seed tourne déjà automatiquement au démarrage (AUTO_SEED=true) ; on le neutralise
 * ici pour ne pas l'exécuter deux fois, même s'il est parfaitement idempotent.
 */
async function bootstrap(): Promise<void> {
  process.env.AUTO_SEED = 'false';

  const context = await NestFactory.createApplicationContext(AppModule);

  try {
    await context.get(SeedService).run();
    Logger.log('Seed terminé.', 'Seed');
  } finally {
    await context.close();
  }
}

bootstrap().catch((error) => {
  Logger.error(error instanceof Error ? error.message : error, 'Seed');
  process.exit(1);
});
