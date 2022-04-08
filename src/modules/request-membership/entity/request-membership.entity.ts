import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { MemberType } from '../../corporate-account/dto/create-corporate-account.dto';
import { User } from '../../users/entities/user.entity';

@Entity('request-membership')
export class RequestMembership extends AbstractEntity {
  //   @Column({ required: false })
  //   quantity: number;

  @ManyToOne(() => User)
  @JoinColumn()
  corporateAccount: User;

  @Column()
  corporateAccountId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ default: false })
  status: boolean;

  @Column({ enum: MemberType })
  type: string;
}
