import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class PushKeysDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  p256dh!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  auth!: string;
}

/** Reflète exactement `PushSubscription.toJSON()` côté navigateur. */
export class SubscribeDto {
  @Matches(/^https:\/\//, {
    message: "L'endpoint doit être une URL https",
  })
  @MaxLength(512)
  endpoint!: string;

  /** Renvoyé par le navigateur mais inutile ici : simplement toléré. */
  @IsOptional()
  @IsNumber()
  expirationTime?: number | null;

  @IsObject()
  @ValidateNested()
  @Type(() => PushKeysDto)
  keys!: PushKeysDto;
}

export class UnsubscribeDto {
  @Matches(/^https:\/\//, {
    message: "L'endpoint doit être une URL https",
  })
  @MaxLength(512)
  endpoint!: string;
}
