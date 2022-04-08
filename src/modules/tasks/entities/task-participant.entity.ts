import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { User } from '../../users/entities/user.entity';
import { Task } from './task.entity';

@Entity('task-participants')
export class TaskParticipant extends AbstractEntity {
  @ManyToOne(() => Task)
  @JoinColumn()
  task: Task;

  @Column()
  taskId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column('float', { default: 0.0 })
  committedCoin: number;

  @Column('jsonb', { nullable: true })
  response: Record<string, any>;

  @Column({ default: false })
  paid: boolean;

  winner: boolean;
}
