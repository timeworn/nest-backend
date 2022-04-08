import { Module } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { LogisticsController } from './logistics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logistic } from './entities/logistic.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Logistic]), ProductsModule],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [TypeOrmModule, LogisticsService],
})
export class LogisticsModule {}
