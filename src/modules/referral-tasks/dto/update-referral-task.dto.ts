import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsNumber, Min, Max, IsBoolean, IsOptional } from 'class-validator';
import { BasicUpdateDto } from '../../../shared/dto/basic-update.dto';
import { AppCurrency } from '../../../shared/enums/app-currency.enum';
import { ReferralTaskCapType } from '../enums/referral-task-cap-type.enum';
import { CreateReferralTaskDto } from './create-referral-task.dto';

export class UpdateReferralTaskDto extends BasicUpdateDto {
  // @IsNotEmpty() amount: number;

  // @IsEnum(AppCurrency)
  // @IsNotEmpty()
  // currency: string;

  // @IsEnum(ReferralTaskCapType)
  // @IsNotEmpty()
  // capType: ReferralTaskCapType;

  // @IsNotEmpty() cap: number;

  // @IsNumber()
  // @IsNotEmpty()
  // @Min(1)
  // @Max(100)
  // refferedByPercentage: number;

  // @IsDate()
  // @IsNotEmpty()
  // startDate: Date;

  // @IsDate()
  // @IsNotEmpty()
  // endDate: Date;

  // @IsNotEmpty() country: string;

  // @IsNotEmpty() lat: number;

  // @IsNotEmpty() lng: number;

  // @IsBoolean()
  // @IsNotEmpty()
  // shareholder: boolean;

  @IsOptional() levels: { range: { min: number; max: number }; percentage: number }[];
}
