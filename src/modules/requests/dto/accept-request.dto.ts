import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CustomOfferDto } from './custom-offer.dto';

export class AcceptRequestDto {
  @ValidateNested()
  @Type(() => CustomOfferDto)
  @IsOptional()
  customOffer: CustomOfferDto;
}
