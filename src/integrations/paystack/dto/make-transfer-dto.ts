import { IsNotEmpty } from 'class-validator';

export class MakeTransferDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  recipient: string;

  @IsNotEmpty()
  reference: string;
}
