import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from 'typeorm';
import { UserStatus, RiskLevel } from '@/types';
import { MoodRecord } from './MoodRecord.entity';
import { MeditationHistory } from './MeditationHistory.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  phone: string;

  @Column({ length: 100, nullable: true, unique: true })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({ length: 50, nullable: true })
  nickname: string;

  @Column({ length: 500, nullable: true })
  avatarUrl: string;

  @Column({ type: 'tinyint', default: 1 })
  status: UserStatus;

  @Column({ type: 'tinyint', default: 0 })
  riskLevel: RiskLevel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @Index()
  deletedAt: Date;

  @OneToMany(() => MoodRecord, moodRecord => moodRecord.user)
  moodRecords: MoodRecord[];

  @OneToMany(() => MeditationHistory, history => history.user)
  meditationHistory: MeditationHistory[];
}
