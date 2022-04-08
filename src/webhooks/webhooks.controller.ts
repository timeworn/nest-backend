import { Body, Controller, Post, Query, UnauthorizedException } from '@nestjs/common';
import { AppConstants } from '../constants';
import { resolveResponse } from '../shared/resolvers';
import { PaystackResponse } from './dto/paystack.response';
import { Thresh0ldDepositResponse } from './dto/thresh0ld-deposit.response';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('paystack')
  handlePaystackWebhook(@Query() query: any, @Body() paystackResponse: PaystackResponse) {
    if (!query) throw new UnauthorizedException('Invalid auth');
    if (query.key != AppConstants.WEBHOOK_PAYSTACK_KEY) throw new UnauthorizedException('Invalid auth');
    return resolveResponse(this.webhooksService.handlePaystackWebhook(paystackResponse));
  }

  @Post('thresh0ld')
  handleThresh0ldWebhook(@Query() query: any, @Body() thresh0ldDepositResponse: Thresh0ldDepositResponse) {
    if (!query) throw new UnauthorizedException('Invalid auth');
    if (query.key != AppConstants.WEBHOOK_THRESHOLD_KEY) throw new UnauthorizedException('Invalid auth');
    return resolveResponse(this.webhooksService.handleThresh0ldWebhook(thresh0ldDepositResponse));
  }
}
