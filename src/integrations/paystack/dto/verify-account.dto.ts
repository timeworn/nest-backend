import { IsNotEmpty } from 'class-validator';

export class VerifyAccountDto {
  @IsNotEmpty()
  accountNumber: string;

  @IsNotEmpty()
  bankCode: string;
}
