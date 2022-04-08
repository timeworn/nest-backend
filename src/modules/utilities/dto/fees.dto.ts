import { IsNotEmpty } from 'class-validator';

export class FeesDto {
  @IsNotEmpty()
  operation: string;

  @IsNotEmpty()
  paymentMethod: string;
}
