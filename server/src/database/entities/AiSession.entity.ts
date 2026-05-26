import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { SessionStatus, RiskFlag } from '@/types';

@Entity('ai_sessions')
export class AiSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ length: 200, nullable: true })
  title: string;

  @Column({ length: 50, nullable: true })
  moodTag: string;

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'tinyint', default: 1 })
  status: SessionStatus;

  @Column({ type: 'tinyint', default: 0 })
  riskFlag: RiskFlag;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
