import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { AppCurrency } from '../../../shared/enums/app-currency.enum';
import { User } from '../../users/entities/user.entity';
import { WalletType } from '../../wallet-types/entities/wallet-type.entity';

@Entity('wallets')
export class Wallet extends AbstractEntity {
  @Column('float', { default: 0 })
  balance: number;

  // @Column({ nullable: true })
  // temp: string;

  // @Column('enum', { enum: AppCurrency })
  // currency: string;

  @Column({ nullable: true })
  address: string;

  @Column()
  userId: string;

  @Column()
  walletTypeId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToOne(() => WalletType, (wallet) => wallet.id, { eager: true })
  @JoinColumn()
  walletType: WalletType;
}
