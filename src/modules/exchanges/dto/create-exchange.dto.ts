import { IsNotEmpty } from 'class-validator';
import { BasicCreateDto } from '../../../shared/dto/basic-create.dto';

export class CreateExchangeDto extends BasicCreateDto {
  @IsNotEmpty()
  link: string;
}
