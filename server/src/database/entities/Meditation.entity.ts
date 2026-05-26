import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { MeditationHistory } from './MeditationHistory.entity';

@Entity('meditations')
export class Meditation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column()
  duration: number;

  @Column({ nullable: true })
  audioUrl: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ default: 1 })
  status: number;

  @Column({ default: 0 })
  playCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => MeditationHistory, history => history.meditation)
  history: MeditationHistory[];
}