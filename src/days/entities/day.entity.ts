import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export enum RewardType {
  GAGE = 'GAGE',
  ANECDOTE = 'ANECDOTE',
  PHOTO = 'PHOTO',
  MOT_DOUX = 'MOT_DOUX',
  BON_MASSAGE = 'BON_MASSAGE',
  INDICE_MYSTERE = 'INDICE_MYSTERE',
}

@Entity('days')
export class Day {
  /** Date du jour au format YYYY-MM-DD : clé primaire naturelle et unique. */
  @PrimaryColumn({ type: 'varchar', length: 10 })
  date: string;

  /** Position du jour dans le calendrier (1 = premier jour), utilisée pour les paliers. */
  @Index()
  @Column({ type: 'integer' })
  dayIndex: number;

  /** Niveau de difficulté = nombre de paires à retrouver. */
  @Column({ type: 'integer' })
  difficultyLevel: number;

  @Column({ type: 'integer' })
  gridRows: number;

  @Column({ type: 'integer' })
  gridCols: number;

  /**
   * Ids des photos tirées pour ce jour (JSON).
   * `null` tant que le jour n'a jamais été consulté : le tirage est paresseux puis figé.
   */
  @Column({ type: 'simple-json', nullable: true })
  photoIds: number[] | null;

  @Column({ type: 'boolean', default: false })
  completed: boolean;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'simple-enum', enum: RewardType })
  rewardType: RewardType;

  /** Texte brut, ou JSON sérialisé selon le type de récompense. */
  @Column({ type: 'text' })
  rewardContent: string;
}
