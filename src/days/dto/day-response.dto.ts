import { RewardType } from '../entities/day.entity';

export interface GridSize {
  rows: number;
  cols: number;
}

/** Réponse de GET /days/today et GET /days/:date/config : tout ce dont le front a besoin pour monter le plateau. */
export interface DayConfigResponse {
  date: string;
  dayIndex: number;
  /** Niveau de difficulté = nombre de paires. */
  difficultyLevel: number;
  pairsCount: number;
  cardsCount: number;
  grid: GridSize;
  /** Ids de photos, remélangés à chaque appel (l'ordre en base ne dit rien du plateau). */
  photoIds: number[];
  completed: boolean;
  completedAt: string | null;
}

/** Réponse de POST /days/:date/complete. */
export interface DayStatusResponse {
  date: string;
  completed: boolean;
  completedAt: string | null;
  /** Faux si le jour était déjà complété (appel idempotent). */
  justCompleted: boolean;
}

/** Réponse de GET /days/:date/reward. */
export interface RewardResponse {
  date: string;
  rewardType: RewardType;
  /** Chaîne, ou objet désérialisé pour les récompenses stockées en JSON. */
  rewardContent: unknown;
}

/** Réponse de GET /days : vue d'ensemble sans divulguer les récompenses non débloquées. */
export interface DaySummaryResponse {
  date: string;
  dayIndex: number;
  difficultyLevel: number;
  pairsCount: number;
  grid: GridSize;
  completed: boolean;
  completedAt: string | null;
  photosDrawn: boolean;
  /** Révélé uniquement une fois le jour complété. */
  rewardType: RewardType | null;
}
