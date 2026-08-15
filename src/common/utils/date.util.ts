const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Vrai si la chaîne est une date calendaire réelle au format YYYY-MM-DD. */
export function isIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value)
  );
}

/** Convertit YYYY-MM-DD en Date UTC (minuit), sans dépendance au fuseau du process. */
export function parseIsoDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Nombre de jours entiers entre deux dates ISO (to - from). */
export function diffInDays(from: string, to: string): number {
  return Math.round(
    (parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / MS_PER_DAY,
  );
}

/** Liste toutes les dates ISO de `start` à `end`, bornes incluses. */
export function enumerateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  for (let cursor = parseIsoDate(start); formatIsoDate(cursor) <= end;) {
    dates.push(formatIsoDate(cursor));
    cursor = new Date(cursor.getTime() + MS_PER_DAY);
  }
  return dates;
}

/**
 * Date courante « métier », calculée côté serveur dans le fuseau configuré.
 * Le client n'envoie jamais sa date : changer l'horloge du téléphone n'a aucun effet.
 */
export function currentDateInTimeZone(timeZone: string): string {
  // La locale en-CA formate nativement en YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
