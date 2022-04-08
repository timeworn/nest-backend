import { Module } from '@nestjs/common';
import { ReferralTasksService } from './referral-tasks.service';
import { ReferralTasksController } from './referral-tasks.controller';
import { ReferralTask } from './entities/referral-task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ReferralTask])],
  controllers: [ReferralTasksController],
  providers: [ReferralTasksService],
})
export class ReferralTasksModule {}
