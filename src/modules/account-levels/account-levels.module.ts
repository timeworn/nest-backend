import { Module } from '@nestjs/common';
import { AccountLevelsService } from './account-levels.service';
import { AccountLevelsController } from './account-levels.controller';
import { AccountLevel } from './entities/account-level.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AccountLevel])],
  controllers: [AccountLevelsController],
  providers: [AccountLevelsService]
})
export class AccountLevelsModule {}
