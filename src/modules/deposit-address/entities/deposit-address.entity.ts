import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { User } from '../../users/entities/user.entity';

@Entity('deposit-addresses')
export class DepositAddress extends AbstractEntity {
  @Column('text')
  address: string;

  @Column()
  userId: string;

  @Column()
  currency: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
