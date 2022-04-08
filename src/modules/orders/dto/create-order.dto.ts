import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { LocationDto } from '../../../shared/dto/location.dto';
import { TransactionPinDto } from '../../../shared/dto/transaction-pin.dto';

export class CreateOrderDto extends TransactionPinDto {
  @IsNotEmpty()
  requestId: string;

  @IsOptional()
  logisticsId: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  deliveryLocation: LocationDto;

  @IsOptional()
  walletId: string;

  @IsNotEmpty()
  paymentMethod: string;
}
