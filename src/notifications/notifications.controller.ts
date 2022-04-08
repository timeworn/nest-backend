import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../shared/decorators/user.decorator';
import { User } from '../modules/users/entities/user.entity';
import { AbstractPaginationDto } from '../shared/dto/abstract-pagination.dto';
import { AuthGuard } from '../shared/guards/auth.guard';
import { resolveResponse } from '../shared/resolvers';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // @Post()
  // create(@Body() createNotificationDto: CreateNotificationDto) {
  //   return this.notificationsService.create(createNotificationDto);
  // }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto, @CurrentUser() user: User) {
    return resolveResponse(this.notificationsService.findAll(pagination, { createdForId: user.id }));
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.notificationsService.findOne(+id);
  // }

  @Patch(':id/mark-as-read')
  update(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.notificationsService.markAsRead(id, user));
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.notificationsService.remove(+id);
  // }
}
