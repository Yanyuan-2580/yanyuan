import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type RiskSource = 'chat' | 'diary' | 'comment' | 'mood';
export type RiskAction = 'crisis_blocked' | 'warned' | 'logged';
export type RiskRecordStatus = 'pending' | 'resolved' | 'false_positive';

@Entity('risk_records')
export class RiskRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ nullable: true })
  sessionId?: number;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'tinyint', default: 0 })
  riskLevel: number;

  @Column({ type: 'varchar', length: 20, default: 'chat' })
  source: RiskSource;

  @Column({ type: 'varchar', length: 20, default: 'logged' })
  action: RiskAction;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: RiskRecordStatus;

  @Column({ type: 'int', nullable: true })
  resolvedBy?: number;

  @Column({ type: 'datetime', nullable: true })
  resolvedAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resolution?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
