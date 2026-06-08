import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('text_chat_sessions')
export class TextChatSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  roomId: string;

  @Column()
  userAId: number;

  @Column()
  userBId: number;

  @Column({ default: 0 })
  messageCount: number;

  @Column({ type: 'text', nullable: true })
  lastMessage: string;

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

