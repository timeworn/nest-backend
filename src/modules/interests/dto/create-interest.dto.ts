import { IsNotEmpty } from 'class-validator';
import { BasicCreateDto } from '../../../shared/dto/basic-create.dto';

export class CreateInterestDto extends BasicCreateDto {
  @IsNotEmpty()
  displayImage: string;
}
