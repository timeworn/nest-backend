import { IsNotEmpty } from 'class-validator';

export class TransactionPinDto {
  @IsNotEmpty()
  transactionPin: string;
}
