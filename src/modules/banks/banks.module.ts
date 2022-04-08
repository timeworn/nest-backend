import { Module } from '@nestjs/common';
import { BanksService } from './banks.service';
import { BanksController } from './banks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bank])],
  controllers: [BanksController],
  providers: [BanksService],
  exports: [TypeOrmModule, BanksService],
})
export class BanksModule {}
