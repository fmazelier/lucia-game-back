import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  validateSync,
} from 'class-validator';

/**
 * Schéma des variables d'environnement.
 * L'application refuse de démarrer si une variable obligatoire manque ou est invalide.
 */
class EnvironmentVariables {
  @IsOptional()
  @IsString()
  PORT?: string;

  @IsString()
  @IsNotEmpty({ message: 'USER_LOGIN est obligatoire' })
  USER_LOGIN!: string;

  @Matches(/^\d{4}$/, { message: 'USER_PIN doit être composé de 4 chiffres' })
  USER_PIN!: string;

  @IsString()
  @Matches(/^.{32,}$/, {
    message: 'JWT_SECRET doit faire au moins 32 caractères',
  })
  JWT_SECRET!: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRES_IN?: string;

  @IsOptional()
  @IsString()
  DATABASE_PATH?: string;

  @IsOptional()
  @IsString()
  PHOTOS_PATH?: string;

  @IsOptional()
  @IsString()
  TIMEZONE?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGINS?: string;

  @IsOptional()
  @Matches(/^\d+$/, {
    message: 'TRUST_PROXY doit être un entier (0 = aucun reverse proxy)',
  })
  TRUST_PROXY?: string;

  @IsOptional()
  @IsBooleanString()
  AUTO_SEED?: string;

  @IsOptional()
  @IsString()
  VAPID_PUBLIC_KEY?: string;

  @IsOptional()
  @IsString()
  VAPID_PRIVATE_KEY?: string;

  @IsOptional()
  @Matches(/^(mailto:|https:\/\/)/, {
    message: 'VAPID_SUBJECT doit commencer par mailto: ou https://',
  })
  VAPID_SUBJECT?: string;

  @IsOptional()
  @Matches(/^(\S+\s+){4}\S+$/, {
    message: 'REMINDER_CRON doit être une expression cron à 5 champs',
  })
  REMINDER_CRON?: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: false,
  });
  const errors = validateSync(validated, {
    skipMissingProperties: false,
    whitelist: false,
  });

  if (errors.length > 0) {
    const details = errors
      .map((error) => Object.values(error.constraints ?? {}).join(', '))
      .join('\n  - ');
    throw new Error(`Configuration .env invalide :\n  - ${details}`);
  }

  return validated;
}
