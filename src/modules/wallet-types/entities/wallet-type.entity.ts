import { Column, Entity } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';

@Entity('wallet-types')
export class WalletType extends BasicEntity {
  @Column()
  currency: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ default: 'Active' })
  status: string;
}
