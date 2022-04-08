import { IsNotEmpty, IsOptional } from 'class-validator';

export class InitializeTransactionDto {
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  email: string;

  @IsOptional()
  metadata?: string;
}
