import { Module } from '@nestjs/common';
import { PaystackService } from '../../integrations/paystack';
import { RedisCacheModule } from '../redis-cache/redis-cache.module';
import { TasksModule } from '../tasks/tasks.module';
import { CronJobsService } from './cron-jobs.service';

@Module({
  imports: [RedisCacheModule, TasksModule],
  providers: [CronJobsService, PaystackService],
  exports: [RedisCacheModule, CronJobsService],
})
export class CronJobsModule {}
