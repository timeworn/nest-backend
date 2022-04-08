import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class CreateCorporateAccountDto {
  @IsNotEmpty()
  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  corporateAccountId: string;

  @IsNotEmpty()
  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  memberId: string;
}

export class GenerateUserLinkDto {
  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  @IsNotEmpty()
  userId: string;
}

export enum MemberStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  SUSPENDED = 'Suspended',
  DECLIENED = 'Decliened',
}

export enum MemberType {
  PRODUCER = 'Producer',
  DISTRIBUTOR = 'Distributor',
}

export class CreateMemberDto {
  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  @IsNotEmpty()
  corporateAccountId: string;

  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  @IsNotEmpty()
  memberId: string;

  @IsOptional()
  @ApiProperty({ example: MemberStatus.ACTIVE })
  status: string;

  @IsNotEmpty()
  @ApiProperty({ example: MemberType.DISTRIBUTOR })
  type: string;
}
