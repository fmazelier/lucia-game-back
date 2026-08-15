import { resolve } from 'node:path';

export interface AppConfiguration {
  port: number;
  /** Fuseau utilisé pour déterminer « le jour courant » côté serveur. */
  timezone: string;
  corsOrigins: string[] | true;
  /** Nombre de reverse proxies de confiance devant l'app (0 = exposée directement). */
  trustProxy: number;
  auth: {
    login: string;
    pin: string;
    jwtSecret: string;
    /** Durée de vie du token : volontairement très longue (couple, usage privé). */
    jwtExpiresIn: string;
  };
  database: {
    path: string;
  };
  photos: {
    path: string;
  };
  push: {
    /** Clés VAPID : si l'une des deux manque, les notifications sont désactivées. */
    vapidPublicKey: string;
    vapidPrivateKey: string;
    /** Contact exigé par la spec Web Push (mailto: ou https:). */
    vapidSubject: string;
    /** Expression cron du rappel quotidien, évaluée dans `timezone`. */
    reminderCron: string;
  };
  /** Lance le seed (photos + jours) automatiquement au démarrage. */
  autoSeed: boolean;
}

export function configuration(): AppConfiguration {
  const corsOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    port: Number.parseInt(process.env.PORT ?? '3000', 10),
    timezone: process.env.TIMEZONE ?? 'Europe/Paris',
    corsOrigins: corsOrigins.length > 0 ? corsOrigins : true,
    trustProxy: Number.parseInt(process.env.TRUST_PROXY ?? '0', 10) || 0,
    auth: {
      login: process.env.USER_LOGIN ?? '',
      pin: process.env.USER_PIN ?? '',
      jwtSecret: process.env.JWT_SECRET ?? '',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '365d',
    },
    database: {
      path: resolve(
        process.cwd(),
        process.env.DATABASE_PATH ?? './data/database.sqlite',
      ),
    },
    photos: {
      path: resolve(process.cwd(), process.env.PHOTOS_PATH ?? './data/photos'),
    },
    push: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY ?? '',
      vapidPrivateKey: process.env.VAPID_PRIVATE_KEY ?? '',
      vapidSubject: process.env.VAPID_SUBJECT ?? 'mailto:noreply@localhost',
      reminderCron: process.env.REMINDER_CRON ?? '0 20 * * *',
    },
    autoSeed: (process.env.AUTO_SEED ?? 'true') === 'true',
  };
}
