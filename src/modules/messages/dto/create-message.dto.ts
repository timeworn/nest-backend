import { ApiHideProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { MessageType } from '../enums/message.enum';

export class CreateMessageDto {
  @IsNotEmpty()
  conversationId: string;

  @IsEnum(MessageType)
  @IsOptional()
  type: string;

  @IsOptional()
  body: string;

  @IsOptional()
  metadata: Record<string, any>;

  // @ApiHideProperty()
  // status: string;

  // @IsOptional()
  // userId: string;
}
