import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { BasicCreateDto } from '../../../shared/dto/basic-create.dto';
import { Helper } from '../../../shared/helpers';

export class CreatePaymentMethodDto extends BasicCreateDto {
  @ApiProperty({ example: Helper.faker.datatype.number({ min: 0.1, max: 3 }) })
  @IsNotEmpty()
  fee: number;
}
