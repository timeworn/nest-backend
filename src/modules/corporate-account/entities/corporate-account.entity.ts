import { Point } from 'geojson';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { User } from '../../users/entities/user.entity';
import { CorporateAccountMember } from './corporate-account-member.entity';

@Entity('corporate-accounts')
export class CorporateAccount extends AbstractEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => CorporateAccountMember, (corporateMember) => corporateMember.corporateAccount)
  members: CorporateAccountMember[];
}
