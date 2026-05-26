import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ArticleStatus } from '@/types';

@Entity('knowledge_articles')
export class KnowledgeArticle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'longtext' })
  content: string;

  @Column({ length: 500, nullable: true })
  coverUrl: string;

  @Column()
  @Index()
  categoryId: number;

  @Column({ type: 'json', nullable: true })
  tags: string[];

  @Column()
  authorId: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @Column({ type: 'int', default: 0 })
  collectCount: number;

  @Column({ type: 'tinyint', default: 0 })
  status: ArticleStatus;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
