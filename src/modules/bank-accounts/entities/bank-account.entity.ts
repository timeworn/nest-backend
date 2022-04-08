import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Helper } from '../../../shared/helpers';
import { Bank } from '../../banks/entities/bank.entity';
import { User } from '../../users/entities/user.entity';

@Entity('bank-accounts')
export class BankAccount extends AbstractEntity {
  @ApiProperty({ example: Helper.faker.finance.account() })
  @Column()
  accountNumber: string;

  @ApiProperty({ example: Helper.faker.finance.accountName() })
  @Column()
  accountName: string;

  @ApiProperty({ example: Helper.faker.finance.iban() })
  @Column({ nullable: true })
  recipientCode: string;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => Bank, { eager: true })
  @JoinColumn()
  bank: Bank;

  @Column()
  bankId: string;

  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  @Column()
  userId: string;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;
}
