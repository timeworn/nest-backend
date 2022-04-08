import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column } from 'typeorm';
import { BasicCreateDto } from '../../../shared/dto/basic-create.dto';
import { AppCurrency } from '../../../shared/enums/app-currency.enum';
import { Helper } from '../../../shared/helpers';

export class CreateBankDto extends BasicCreateDto {
  @ApiProperty({ example: Helper.faker.image.imageUrl() })
  @IsOptional()
  logo: string;

  @ApiProperty({ example: '026' })
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: AppCurrency.NAIRA })
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 'Nigeria' })
  @IsNotEmpty()
  country: string;
}
