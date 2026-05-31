import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column({ length: 50 })
  type: string; // 'system' | 'chat' | 'risk' | 'community' | 'reminder'

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint', default: 0 })
  isRead: boolean;

  @Column({ length: 50, nullable: true })
  referenceType: string;

  @Column({ nullable: true })
  referenceId: number;

  @CreateDateColumn()
  createdAt: Date;
}
