import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User.entity';
import { Meditation } from './Meditation.entity';

@Entity('meditation_history')
export class MeditationHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  meditationId: number;

  @Column()
  duration: number;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.meditationHistory)
  user: User;

  @ManyToOne(() => Meditation, meditation => meditation.history)
  meditation: Meditation;
}