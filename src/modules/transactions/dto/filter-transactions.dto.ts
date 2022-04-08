import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class FilterTransactionsDto {
  @Transform(({ value }) => Helper.tranformValue(value))
  @IsOptional()
  walletId?: string;
}
