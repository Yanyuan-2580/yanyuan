import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Questionnaire } from './Questionnaire.entity';

@Entity('questionnaire_results')
export class QuestionnaireResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  questionnaireId: number;

  @ManyToOne(() => Questionnaire)
  @JoinColumn({ name: 'questionnaireId' })
  questionnaire: Questionnaire;

  @Column({ type: 'json' })
  answers: Array<{
    questionId: number;
    selectedValue: number;
    score: number;
  }>;

  @Column({ type: 'int' })
  totalScore: number;

  @Column({ length: 50 })
  resultLevel: 'low' | 'moderate' | 'high';

  @Column({ type: 'text', nullable: true })
  aiAdvice: string;

  @CreateDateColumn()
  createdAt: Date;
}
