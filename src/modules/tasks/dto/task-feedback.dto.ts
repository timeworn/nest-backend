import { IsOptional } from 'class-validator';

export class TaskFeedbackDto {
  @IsOptional()
  image: string;

  @IsOptional()
  comment: string;
}
