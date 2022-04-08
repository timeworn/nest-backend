import { IsNotEmpty } from 'class-validator';
import { BasicCreateDto } from '../../../shared/dto/basic-create.dto';

export class CreateAccountLevelDto extends BasicCreateDto {
  @IsNotEmpty()
  level: string;
}
