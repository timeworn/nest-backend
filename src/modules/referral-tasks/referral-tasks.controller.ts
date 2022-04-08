import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ReferralTasksService } from './referral-tasks.service';
import { CreateReferralTaskDto } from './dto/create-referral-task.dto';
import { UpdateReferralTaskDto } from './dto/update-referral-task.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AppRoles } from '../roles/enums/roles.enum';
import { UseAppRoles } from '../../shared/decorators/role.decorator';
import { resolveResponse } from '../../shared/resolvers';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ReferralTaskStatus } from './enums/referral-task-status.enum';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Referral Tasks')
@Controller('referral-tasks')
export class ReferralTasksController {
  constructor(private readonly referralSettingsService: ReferralTasksService) {}

  // @UseAppRoles(AppRoles.ADMIN)
  @Post()
  create(@Body() createReferralTaskDto: CreateReferralTaskDto) {
    return resolveResponse(this.referralSettingsService.create(createReferralTaskDto));
  }

  // @Get()
  // findAll(@Query() pagination: AbstractPaginationDto) {
  //   return resolveResponse(this.referralSettingsService.findAll(pagination));
  // }

  @Get()
  list(/* @Query('country') country: string */ @CurrentUser() user: User) {
    return resolveResponse(
      this.referralSettingsService.list({
        country: user.country,
        status: ReferralTaskStatus.Active,
      }),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.referralSettingsService.findOne(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReferralTaskDto: UpdateReferralTaskDto) {
    return resolveResponse(this.referralSettingsService.update(id, updateReferralTaskDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.referralSettingsService.remove(id));
  }
}
