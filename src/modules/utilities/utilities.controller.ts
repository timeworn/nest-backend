import { Body, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UtilitiesService } from './utilities.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { VerifyAccountDto } from '../../integrations/paystack';
import { Post } from '@nestjs/common';
import { resolveResponse } from '../../shared/resolvers';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { FeesDto } from './dto/fees.dto';

@ApiTags('Utilities')
@Controller('utils')
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Get('get-banks')
  findAllBanks() {
    return this.utilitiesService.findAllBanks();
  }

  @Post('verify-account')
  verifyAccount(@Body() verifyAccountDto: VerifyAccountDto) {
    return resolveResponse(this.utilitiesService.verifyAccount(verifyAccountDto));
  }

  // @UseGuards(AuthGuard)
  // @ApiBearerAuth()
  @Get('currency-rates')
  currencyExchangeRates(@Query('currency') currency: string) {
    return resolveResponse(this.utilitiesService.currencyExchangeRates(currency));
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('pay-with-paystack')
  payWithPaystack(@Body('amount') amount: number, @CurrentUser() user: User) {
    return resolveResponse(this.utilitiesService.payWithPaystack(amount, user));
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('fees')
  async fees(@Body() options: FeesDto) {
    return resolveResponse(this.utilitiesService.fees(options));
  }
}
