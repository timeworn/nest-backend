import { ApiProperty } from '@nestjs/swagger';
import { AbstractResponse } from '../../shared/abstract.response';

export class PermissionResponse extends AbstractResponse {
  // @ApiProperty()
  // id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  // @ApiProperty()
  // createdAt: Date;

  // @ApiProperty()
  // updatedAt: Date;
}

export class PermissionListResponse {}
