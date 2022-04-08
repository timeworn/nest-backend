import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { resolveResponse } from '../../shared/resolvers';

@ApiBearerAuth()
@ApiTags('Messages')
@UseGuards(AuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: User) {
    return resolveResponse(this.messagesService.create(createMessageDto, user));
  }

  @Get(':conversationId')
  findAll(@Param('conversationId') conversationId: string, @CurrentUser() user: User) {
    return resolveResponse(this.messagesService.findAll(conversationId, user));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.messagesService.findOne(+id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return resolveResponse(this.messagesService.update(+id, updateMessageDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.messagesService.remove(+id));
  }
}
