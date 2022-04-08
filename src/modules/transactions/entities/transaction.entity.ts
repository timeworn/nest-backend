import { AfterLoad, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Helper } from '../../../shared/helpers';
import { User } from '../../users/entities/user.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';
import { TransactionOperations, TransactionTypes } from '../enums/transactions.enum';
import { TransactionMetadata } from '../interfaces/transaction-meta';

@Entity('transactions')
export class Transaction extends AbstractEntity {
  @Column()
  currency: string;

  @Column()
  method: string;

  @Column('enum', { enum: TransactionTypes })
  type: string;

  @Column('enum', { enum: TransactionOperations })
  operation: string;

  @Column('float')
  amount: number;

  // @Column()
  // cliqToken?: number;

  @Column()
  status: string;

  @Column()
  reference: string;

  @Column('jsonb')
  metadata: Partial<TransactionMetadata>;
  // metadata: Record<string, any>;

  @Column('jsonb', { default: {} })
  serverMetadata: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Column({ nullable: true })
  accessCode?: string;

  @Column({ nullable: true })
  charges?: number;

  @Column({ nullable: true })
  url?: string;

  @ManyToOne(() => Wallet)
  @JoinColumn()
  wallet: Wallet;

  @Column({ nullable: true })
  walletId?: string;

  // @Column({ nullable: true })
  // secondaryTxId: string;

  @AfterLoad()
  handleAfterLoad() {
    this.metadata.transactionId = this.id;
    this.metadata.transactionMethod = this.method;
    this.metadata.transactionId = Helper.encodeId('tr', this.id);
    return this;
  }
}
