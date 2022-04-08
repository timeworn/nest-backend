import { IsNotEmpty, IsOptional } from 'class-validator';

export class FetchFareDto {
  @IsOptional() pickupLatitude?: number;
  @IsOptional() pickupLongitude?: number;
  @IsNotEmpty() deliveryLatitude: number;
  @IsNotEmpty() deliveryLongitude: number;
  @IsOptional() productId?: string;
}
