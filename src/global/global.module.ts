import { Global, Module } from '@nestjs/common';
import { FlutterwaveService } from '../integrations/flutterwave/flutterwave.service';
import { GokadaService } from '../integrations/gokada';
import { LatokenService } from '../integrations/latoken/latoken.service';
import { PaystackService } from '../integrations/paystack';
import { RedisCacheModule } from '../modules/redis-cache/redis-cache.module';

@Global()
@Module({
  imports: [RedisCacheModule],
  providers: [PaystackService, FlutterwaveService, GokadaService, LatokenService],
  exports: [RedisCacheModule, PaystackService, FlutterwaveService, GokadaService, LatokenService],
})
export class GlobalModule {}
