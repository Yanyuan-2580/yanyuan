import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('text_chat_messages')
export class TextChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  roomId: string;

  @Column()
  senderId: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}

