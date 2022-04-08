import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { resolveResponse } from '../../shared/resolvers';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { FilterTasksDto } from './dto/filter-task.dto';
import { TaskStatus } from './enums/task-status.enum';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { TransactionPinGuard } from '../../shared/guards/transaction-pin.guard';
import { TransactionPinDto } from '../../shared/dto/transaction-pin.dto';
import { TaskFeedbackDto } from './dto/task-feedback.dto';
import { Not } from 'typeorm';
import { CompleteTaskDto } from './dto/complete-task.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return resolveResponse(this.tasksService.create(createTaskDto, user));
  }

  @UseGuards(TransactionPinGuard)
  @ApiOperation({ summary: 'Join a task' })
  @Patch(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: User, @Body() transactionPinDto: TransactionPinDto) {
    return resolveResponse(this.tasksService.join(id, user, transactionPinDto.transactionPin));
  }

  // @UseGuards(TransactionPinGuard)
  @ApiOperation({ summary: 'Give feedback on a task' })
  @Patch(':id/feedback')
  feedback(@Param('id') id: string, @CurrentUser() user: User, @Body() taskFeedbackDto: TaskFeedbackDto) {
    return resolveResponse(this.tasksService.feedback(id, user, taskFeedbackDto));
  }

  @ApiOperation({ summary: 'Complete a task' })
  @Patch(':id/complete')
  complete(@Param('id') id: string, @Body() completeTaskDto: CompleteTaskDto) {
    return resolveResponse(this.tasksService.complete(id, completeTaskDto, true));
  }

  // @Get()
  // findAll(@Query() pagination: AbstractPaginationDto, @Query() filter: FilterTasksDto, @CurrentUser() user: User) {
  //   return resolveResponse(
  //     this.tasksService.findAll(pagination, filter, {
  //     }),
  //   );
  // }

  @Get()
  list(@Query() filter: FilterTasksDto, @CurrentUser() user: User) {
    return resolveResponse(this.tasksService.list(filter, user));
  }

  @Get('my-tasks/get')
  myTasks(@Query() filter: FilterTasksDto, @CurrentUser() user: User) {
    return resolveResponse(this.tasksService.myTasks(user));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.tasksService.findOne(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return resolveResponse(this.tasksService.update(id, updateTaskDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.tasksService.remove(id));
  }
}
