import { IsNotEmpty } from 'class-validator';

export class FundFiatWallet {
  @IsNotEmpty()
  amount: number;
}
