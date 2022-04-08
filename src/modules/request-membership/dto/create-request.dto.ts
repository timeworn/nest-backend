import { MemberType } from './../../corporate-account/dto/create-corporate-account.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class CreateMembershipRequestDto {
  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  @IsNotEmpty()
  corporateId: string;

  @ApiProperty({ example: MemberType.DISTRIBUTOR })
  @IsNotEmpty()
  type: string;
}
