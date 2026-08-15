import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: "L'identifiant est obligatoire." })
  @MaxLength(64)
  login: string;

  /** PIN à 4 chiffres, transmis en chaîne pour conserver les zéros de tête. */
  @IsString()
  @Matches(/^\d{4}$/, {
    message: 'Le code PIN doit contenir exactement 4 chiffres.',
  })
  pin: string;
}
