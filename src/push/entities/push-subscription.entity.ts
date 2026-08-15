import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('push_subscriptions')
export class PushSubscription {
  /**
   * URL fournie par le service de push du navigateur : identifiant naturel de l'abonnement.
   * C'est une « capability URL » : quiconque la possède peut notifier l'appareil.
   */
  @PrimaryColumn({ type: 'varchar', length: 512 })
  endpoint: string;

  /** Clé publique de chiffrement du client. */
  @Column({ type: 'varchar', length: 255 })
  p256dh: string;

  /** Secret d'authentification du client. */
  @Column({ type: 'varchar', length: 255 })
  auth: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;
}
