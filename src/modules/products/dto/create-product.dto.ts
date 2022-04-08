import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { AppCurrency } from '../../../shared/enums/app-currency.enum';
import { Helper } from '../../../shared/helpers';

export class CreateProductDto {
  @ApiProperty({ example: Helper.faker.commerce.product() })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'NGN' })
  @IsEnum([AppCurrency.NAIRA, AppCurrency.CLIQ_TOKEN])
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: Helper.faker.lorem.paragraph() })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: [Helper.faker.datatype.uuid()] })
  @IsNotEmpty()
  categoryIds: string[];

  @ApiProperty({ example: Helper.faker.address.longitude() })
  @IsNotEmpty()
  @IsNumber()
  lng: number;

  @ApiProperty({ example: Helper.faker.address.longitude() })
  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @ApiProperty({ example: Helper.faker.address.streetAddress() })
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: [Helper.faker.datatype.uuid()] })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  tagIds: string[];

  @ApiProperty({ example: Helper.faker.commerce.price() })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({
    example: [Helper.faker.image.imageUrl(), Helper.faker.image.imageUrl(), Helper.faker.image.imageUrl()],
  })
  @ArrayMinSize(3)
  @IsOptional()
  images: string[];

  @ApiProperty({
    example: false,
  })
  @IsNotEmpty()
  published: boolean = true;
}
