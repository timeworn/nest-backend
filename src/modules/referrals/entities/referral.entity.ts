import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { ReferralTask } from '../../referral-tasks/entities/referral-task.entity';
import { User } from '../../users/entities/user.entity';

@Entity('referrals')
export class Referral extends AbstractEntity {
  @Column('float') amount: number;

  @ManyToOne(() => ReferralTask, { eager: true })
  @JoinColumn()
  referralTask: ReferralTask;

  @Column() referralTaskId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  referredBy: User;

  @Column() referredById: string;

  @ManyToOne(() => User)
  @JoinColumn()
  referred: User;

  @Column() referredId: string;

  @Column('jsonb', { default: [] }) transactions: string[];
  // @Column('jsonb', { default: [] }) history: {amount: number, }[];

  @Column({ default: false }) hasWithdrawn: boolean;
}
