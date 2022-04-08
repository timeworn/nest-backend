import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { User } from '../../users/entities/user.entity';
import { MemberStatus, MemberType } from '../dto/create-corporate-account.dto';
import { CorporateAccount } from './corporate-account.entity';

@Entity('corporate-account-members')
export class CorporateAccountMember extends AbstractEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  corporateAccount: User;

  @Column()
  corporateAccountId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  member: User;

  @Column()
  memberId: string;

  @Column({ enum: MemberStatus })
  status: string;

  @Column({ enum: MemberType })
  type: string;
}
