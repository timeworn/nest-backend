import { Module } from '@nestjs/common';
import { OrdersModule } from '../modules/orders/orders.module';
import { ReferralsModule } from '../modules/referrals/referrals.module';
import { RequestsModule } from '../modules/requests/requests.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [OrdersModule, ReferralsModule, RequestsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
