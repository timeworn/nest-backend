import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from '../enums/task-status.enum';

export class FilterTasksDto {
  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDING })
  @IsOptional()
  @IsEnum(TaskStatus)
  status: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  userId: string;
}
