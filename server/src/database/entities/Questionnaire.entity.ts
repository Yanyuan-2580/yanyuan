import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('questionnaires')
export class Questionnaire {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 50 })
  category: string; // 'anxiety' | 'depression' | 'stress' | 'sleep' | 'general'

  @Column({ type: 'json' })
  questions: Array<{
    id: number;
    text: string;
    options: Array<{
      value: number;
      label: string;
      score: number;
    }>;
  }>;

  @Column({ type: 'json', nullable: true })
  scoringRules: Array<{
    min: number;
    max: number;
    level: 'low' | 'moderate' | 'high';
    label: string;
  }>;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0: inactive, 1: active

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
