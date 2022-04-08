import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class SubscribeToCategoriesDto {
  @ApiProperty({
    example: [Helper.faker.datatype.uuid()],
  })
  @IsOptional()
  categoryIds: string[];
}
