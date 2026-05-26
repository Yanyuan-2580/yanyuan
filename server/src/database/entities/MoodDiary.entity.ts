import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { DiaryStatus } from '@/types';

@Entity('mood_diaries')
export class MoodDiary {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ type: 'int' })
  moodScore: number;

  @Column({ type: 'json', nullable: true })
  moodTags: string[];

  @Column({ type: 'text', nullable: true })
  triggerEvent: string;

  @Column({ type: 'text', nullable: true })
  bodyFeeling: string;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  sleepHours: number;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  aiInsight: string;

  @Column({ type: 'tinyint', default: 0 })
  isPublic: DiaryStatus;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
