import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsModule } from '../requests/requests.module';
import { LogisticsModule } from '../logistics/logistics.module';
import { UtilitiesModule } from '../utilities/utilities.module';
import { ReferralsModule } from '../referrals/referrals.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), RequestsModule, LogisticsModule, UtilitiesModule, ReferralsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}
