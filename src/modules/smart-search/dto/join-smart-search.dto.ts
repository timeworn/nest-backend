import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CustomOfferDto } from '../../requests/dto/custom-offer.dto';

export class JoinSmartSearchDto {
  @IsNotEmpty()
  productId: string;

  @ValidateNested()
  @Type(() => CustomOfferDto)
  @IsOptional()
  customOffer: CustomOfferDto;
}
