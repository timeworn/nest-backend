import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class FilterProductsDto {
  @IsOptional()
  @Transform(({ value }) => Helper.tranformValue(value))
  name?: string;

  @IsOptional()
  @Transform(({ value }) => Helper.tranformValue(value))
  lat?: number;

  @IsOptional()
  @Transform(({ value }) => Helper.tranformValue(value))
  lng?: number;

  @IsOptional()
  @Transform(({ value }) => Helper.tranformValue(value))
  userId?: string;

  @IsOptional()
  @Transform(({ value }) => Helper.tranformValue(value))
  categoryId?: string;

  @IsOptional()
  @Transform(({ value }) => Helper.tranformValue(value))
  categoryIds?: string[];
}
