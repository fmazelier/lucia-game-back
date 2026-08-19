import {
  ConsoleLogger,
  LogLevel,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { AppConfiguration } from './config/configuration';

/** Du plus bavard au plus critique : LOG_LEVEL active le niveau choisi et tous ceux au-dessus. */
const LOG_LEVELS: LogLevel[] = [
  'verbose',
  'debug',
  'log',
  'warn',
  'error',
  'fatal',
];
const DEFAULT_LOG_LEVEL: LogLevel = 'log';

function resolveLogLevels(): LogLevel[] {
  const requested = (process.env.LOG_LEVEL ?? '').toLowerCase() as LogLevel;
  const index = LOG_LEVELS.indexOf(requested);

  // Le logger est créé avant la validation du .env : une valeur inconnue ne doit pas rendre l'app muette.
  return LOG_LEVELS.slice(
    index === -1 ? LOG_LEVELS.indexOf(DEFAULT_LOG_LEVEL) : index,
  );
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new ConsoleLogger({
      logLevels: resolveLogLevels(),
      // CapRover affiche les logs bruts : les codes couleur ANSI y ressortent en caractères parasites.
      colors: process.env.NODE_ENV !== 'production',
      json: process.env.LOG_JSON === 'true',
    }),
  });
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

void bootstrap().catch((error: unknown) => {
  // Sans ça, un échec de démarrage (config invalide, port occupé…) sort en unhandled rejection illisible.
  Logger.fatal(error instanceof Error ? error.stack : error, 'Bootstrap');
  process.exit(1);
});
