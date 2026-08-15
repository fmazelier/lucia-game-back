import { IsDateString, Matches } from 'class-validator';

/** Paramètre de route `:date`, validé avant d'atteindre le service. */
export class DayDateParamDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit être au format YYYY-MM-DD.',
  })
  @IsDateString(
    { strict: true },
    { message: "La date n'existe pas dans le calendrier grégorien." },
  )
  date: string;
}
