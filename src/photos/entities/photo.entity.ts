import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('photos')
export class Photo {
  /** Identifiant numérique = nom du fichier (12 → 12.webp). */
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  filename: string;

  /**
   * Tags libres, séparés par des virgules en base.
   * Le tag `exclude` retire la photo du pool de tirage.
   */
  @Column({ type: 'simple-array', default: '' })
  tags: string[];
}
