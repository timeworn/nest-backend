import { IsNotEmpty } from 'class-validator';

export class CreateTransferRecipientDto {
  // @IsNotEmpty()
  // name: string;

  @IsNotEmpty()
  accountNumber: string;

  @IsNotEmpty()
  bankCode: string;
}
