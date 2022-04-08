import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TransactionPinDto } from '../../../shared/dto/transaction-pin.dto';
import { WithdrawalType } from '../enums/withdrawal-type.enum';

export class WithdrawFromWalletDto extends TransactionPinDto {
  @IsEnum(WithdrawalType)
  @IsNotEmpty()
  withdrawalType: WithdrawalType;

  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  walletId: string;

  @IsNotEmpty()
  identifier: string;

  // @IsOptional()
  // metadata: {
  //   accountName:
  // }
}
