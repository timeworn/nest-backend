import { IsOptional } from 'class-validator';

export class GenerateTransactionStatementDto {
  @IsOptional()
  walletId: string;

  @IsOptional()
  startDate: string;

  @IsOptional()
  endDate: string;
}
