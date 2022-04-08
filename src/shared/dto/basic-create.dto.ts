import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Helper } from '../helpers';

export class BasicCreateDto {
  @ApiProperty({ example: Helper.faker.lorem.word() })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: Helper.faker.lorem.paragraphs() })
  @IsNotEmpty()
  description: string;
}
