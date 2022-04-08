import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsUUID } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class CreateBankAccountDto {
  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({ example: Helper.faker.name.findName() })
  // accountName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: Helper.faker.finance.account() })
  accountNumber: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({ example: Helper.faker.datatype.boolean() })
  isDefault: boolean;

  @IsNotEmpty()
  // @IsNumber()
  // @IsUUID()
  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  bankId: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({
  //   example: Helper.faker.datatype.number({ min: 100, max: 300 }),
  // })
  // bankCode: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({ example: Helper.faker.lorem.word() })
  // bankName: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({ example: Helper.faker.random.image() })
  // bankLogo: string;

  // @IsNotEmpty()
  // @IsString()
  // @ApiProperty({
  //   example: Helper.faker.datatype.number({ min: 100, max: 300 }),
  // })
  // recipientCode: string;
}
