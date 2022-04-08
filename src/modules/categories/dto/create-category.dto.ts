import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BasicCreateDto } from '../../../shared/dto/basic-create.dto';
import { Helper } from '../../../shared/helpers';

export class CreateCategoryDto extends BasicCreateDto {
  @ApiProperty({ example: Helper.faker.datatype.uuid() })
  @IsOptional()
  parentId: string;
}
