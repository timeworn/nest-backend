import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  quantity: number;
}

export class CreateRequestFromSearchDto {
  @IsNotEmpty()
  searchParticipantId: string;

  @IsOptional()
  quantity: number;
}
