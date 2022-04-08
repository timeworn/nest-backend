import { IsNotEmpty } from 'class-validator';
import { Wallet } from '../../wallets/entities/wallet.entity';

export class CreateReferralDto {
  @IsNotEmpty()
  referralCode: string;

  fiatWallet: Wallet;
}
