import { IsNotEmpty, IsOptional } from 'class-validator';

export class CustomOfferDto {
  @IsNotEmpty() quantity: number;

  @IsOptional() amount: number;

  @IsNotEmpty() description: string;
}
