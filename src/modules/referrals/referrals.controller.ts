import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { resolveResponse } from '../../shared/resolvers';
import { User } from '../users/entities/user.entity';

@ApiTags('Referrals')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  // @Post()
  // create(@Body() createReferralDto: CreateReferralDto) {
  //   return resolveResponse(this.referralsService.create(createReferralDto));
  // }

  // @Get()
  // findAll() {
  //   return resolveResponse(this.referralsService.findAll());
  // }

  @Get('my-referrals/get')
  myReferrals(@Query('referralTaskId') referralTaskId: string, @CurrentUser() user: User) {
    return resolveResponse(this.referralsService.myReferrals(referralTaskId, user));
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return resolveResponse(this.referralsService.findOne(+id));
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReferralDto: UpdateReferralDto) {
  //   return resolveResponse(this.referralsService.update(+id, updateReferralDto));
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return resolveResponse(this.referralsService.remove(+id));
  // }
}
