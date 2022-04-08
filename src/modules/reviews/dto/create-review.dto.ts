import { ApiHideProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class CreateReviewDto {
  // @IsNotEmpty()
  // orderId: string;

  @IsNotEmpty()
  comment: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiHideProperty()
  userId: string;
}
