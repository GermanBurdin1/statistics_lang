import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('statistics')
export class Statistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  type: string;

  @Column('jsonb', { nullable: true })
  data: any;

  // TODO : ajouter un index sur createdAt pour améliorer les performances des requêtes temporelles
  @CreateDateColumn()
  createdAt: Date;
} 