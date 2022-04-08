import { BadRequestException, Injectable } from '@nestjs/common';
import { FlutterwaveService } from '../../integrations/flutterwave/flutterwave.service';
import { PaystackService, VerifyAccountDto } from '../../integrations/paystack';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { User } from '../users/entities/user.entity';
import * as fees from '../../config/fees.json';

@Injectable()
export class UtilitiesService {
  constructor(
    private readonly flutterwaveService: FlutterwaveService,
    private readonly paystackService: PaystackService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  findAllBanks() {
    return this.flutterwaveService.findAllBanks();
  }

  verifyAccount(verifyAccountDto: VerifyAccountDto) {
    return this.paystackService.createTransferRecipient(verifyAccountDto);
  }

  async currencyExchangeRates(currency: string) {
    const response: any = await this.redisCacheService.get('currency_exchange_rates');
    const data = response.data.rates;
    if (!data[currency]) {
      throw new BadRequestException('Invalid currency');
    }

    return data[currency];
  }

  async payWithPaystack(amount: number, user: User) {
    const paystackTransaction = await this.paystackService.initializeTransaction({
      email: user.email,
      amount: amount + 150,
    });

    return paystackTransaction;
  }

  async fees(options: { operation: string; paymentMethod: string }) {
    return fees.find((x) => x.operation == options.operation && x.paymentMethod == options.paymentMethod);
  }
}
