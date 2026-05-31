import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('video_sessions')
export class VideoSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ length: 100, unique: true })
  roomId: string;

  @Column({ length: 50, default: 'waiting' })
  status: string; // 'waiting' | 'active' | 'ended'

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  endedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
