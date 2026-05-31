import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ length: 50 })
  type: string; // 'meditation' | 'diary' | 'mood' | 'breathing' | 'custom'

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 10 })
  time: string; // 'HH:mm' format

  @Column({ type: 'json' })
  daysOfWeek: number[]; // [0-6], 0=Sunday

  @Column({ type: 'tinyint', default: 1 })
  enabled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastTriggeredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
