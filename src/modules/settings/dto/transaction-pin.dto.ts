import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class SetTransactionPinDto {
  @ApiProperty({ example: 1234 })
  @IsNotEmpty()
  transactionPin: string;

  // @ApiProperty({ example: 6574 })
  // @IsNotEmpty()
  // otp: string;

  @ApiProperty({ example: Helper.faker.internet.password() })
  @IsNotEmpty()
  password: string;
}
