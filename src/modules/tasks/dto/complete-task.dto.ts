import { ArrayMinSize, IsNotEmpty } from 'class-validator';

export class CompleteTaskDto {
  @ArrayMinSize(1)
  @IsNotEmpty()
  winnersId?: string[];
}
