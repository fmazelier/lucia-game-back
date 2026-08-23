/**
 * Bornes du calendrier, incluses, au format YYYY-MM-DD.
 * Modifier ces deux valeurs suffit à décaler ou rallonger le calendrier :
 * le seed (idempotent) créera les jours manquants au prochain démarrage.
 */
export const CALENDAR_START_DATE = '2026-08-16';
export const CALENDAR_END_DATE = '2026-09-10';

export interface DifficultyTier {
  /** Index (base 1) du premier jour concerné par ce palier. */
  fromDay: number;
  /** Nombre de paires à retrouver = nombre de photos distinctes tirées pour le jour. */
  pairs: number;
  rows: number;
  cols: number;
}

/**
 * Paliers de difficulté progressifs.
 * Le calendrier 16/08/2026 -> 10/09/2026 compte 26 jours, répartis 5/5/5/5/6.
 */
export const DIFFICULTY_TIERS: readonly DifficultyTier[] = [
  { fromDay: 1, pairs: 6, rows: 3, cols: 4 },
  { fromDay: 5, pairs: 8, rows: 4, cols: 4 },
  { fromDay: 9, pairs: 10, rows: 4, cols: 5 },
  { fromDay: 13, pairs: 12, rows: 4, cols: 6 },
  { fromDay: 17, pairs: 15, rows: 5, cols: 6 },
  { fromDay: 21, pairs: 18, rows: 6, cols: 6 },
  { fromDay: 24, pairs: 18, rows: 7, cols: 6 },
  { fromDay: 26, pairs: 21, rows: 7, cols: 6 },
];

/** Nombre de jours précédents dont on évite de réutiliser les photos lors d'un tirage. */
export const PHOTO_COOLDOWN_DAYS = 3;

/** Tag qui retire définitivement une photo du pool de tirage. */
export const EXCLUDED_PHOTO_TAG = 'exclude';

/** Extensions d'images acceptées dans le dossier PHOTOS_PATH. */
export const ALLOWED_PHOTO_EXTENSIONS = [
  '.webp',
  '.jpg',
  '.jpeg',
  '.png',
] as const;

/** Retourne le palier de difficulté applicable à un index de jour (base 1). */
export function getDifficultyTier(dayIndex: number): DifficultyTier {
  let tier = DIFFICULTY_TIERS[0];
  for (const candidate of DIFFICULTY_TIERS) {
    if (dayIndex >= candidate.fromDay) {
      tier = candidate;
    }
  }
  return tier;
}
