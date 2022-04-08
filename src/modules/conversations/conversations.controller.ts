import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { User } from '../users/entities/user.entity';
import { ConversationsService } from './conversations.service';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Conversations')
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post(':productId')
  create(@Param('productId') productId: string, @CurrentUser() user: User) {
    return resolveResponse(this.conversationsService.create(productId, user));
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return resolveResponse(this.conversationsService.findAll(user));
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return resolveResponse(this.conversationsService.findOne(+id));
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto) {
  //   return resolveResponse(this.conversationsService.update(+id, updateConversationDto));
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return resolveResponse(this.conversationsService.remove(+id));
  // }
}
