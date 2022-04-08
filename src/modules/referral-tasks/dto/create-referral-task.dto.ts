import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { BasicCreateDto } from '../../../shared/dto/basic-create.dto';
import { AppCurrency } from '../../../shared/enums/app-currency.enum';
import { ReferralTaskCapType } from '../enums/referral-task-cap-type.enum';

export class CreateReferralTaskDto extends BasicCreateDto {
  @IsNotEmpty() amount: number;

  @IsEnum(AppCurrency)
  @IsNotEmpty()
  currency: string;

  @IsEnum(ReferralTaskCapType)
  @IsNotEmpty()
  capType: ReferralTaskCapType;

  @IsNotEmpty() cap: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  refferedByPercentage: number;

  // @IsDate()
  @IsNotEmpty()
  startDate: Date;

  // @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty() country: string;

  @IsNotEmpty() lat: number;

  @IsNotEmpty() lng: number;

  @IsBoolean()
  @IsNotEmpty()
  shareholder: boolean;

  @IsOptional() levels: { range: { min: number; max: number }; percentage: number }[];
}
