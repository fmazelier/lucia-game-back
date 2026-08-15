import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppConfiguration } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService =
    app.get<ConfigService<AppConfiguration, true>>(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: configService.get('corsOrigins', { infer: true }),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Derrière un reverse proxy (nginx de CapRover), sans ça req.ip vaut l'IP du proxy
  // et le rate limiting du login s'appliquerait à tout le monde d'un coup.
  const trustProxy = configService.get('trustProxy', { infer: true });
  if (trustProxy > 0) {
    app.set('trust proxy', trustProxy);
  }

  app.disable('x-powered-by');

  const port = configService.get('port', { infer: true });
  await app.listen(port, '0.0.0.0');

  Logger.log(`API démarrée sur le port ${port}`, 'Bootstrap');
}

void bootstrap();
