import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('admin_operation_logs')
export class AdminOperationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  adminId: number;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 50 })
  targetType: string;

  @Column({ nullable: true })
  targetId: number;

  @Column({ type: 'json', nullable: true })
  detail: Record<string, any>;

  @Column({ length: 45 })
  ip: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
