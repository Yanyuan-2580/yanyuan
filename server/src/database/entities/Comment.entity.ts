import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { KnowledgeArticle } from './KnowledgeArticle.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  articleId: number;

  @ManyToOne(() => KnowledgeArticle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'articleId' })
  article: KnowledgeArticle;

  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => Comment, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Comment;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0: deleted, 1: active

  @CreateDateColumn()
  createdAt: Date;
}
