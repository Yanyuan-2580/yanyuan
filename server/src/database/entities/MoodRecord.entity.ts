import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User.entity';

@Entity('mood_records')
export class MoodRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  moodScore: number;

  @Column()
  moodType: 'happy' | 'sad' | 'angry' | 'anxious' | 'calm';

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  aiSuggestion: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.moodRecords)
  user: User;
}