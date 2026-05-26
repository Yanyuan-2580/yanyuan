import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('article_collects')
export class ArticleCollect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  userId: number;

  @Column()
  @Index()
  articleId: number;

  @CreateDateColumn()
  createdAt: Date;
}
