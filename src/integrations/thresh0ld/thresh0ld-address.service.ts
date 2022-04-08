import { Injectable } from '@nestjs/common';
import { AppConstants } from '../../constants';
import { Thresh0ldService } from './thresh0ld.service';

@Injectable()
export class Thresh0ldAddressService {
  constructor(private readonly thresh0ldService: Thresh0ldService) {}

  generateBTCAddress(): Promise<string[]> {
    return this.thresh0ldService.generateDepositAddress({
      walletSecret: AppConstants.THRESHOLD_BTC_WALLET_SECRET,
      walletCode: AppConstants.THRESHOLD_BTC_WALLET_CODE,
      walletId: AppConstants.THRESHOLD_BTC_WALLET_ID,
    });
  }

  generateBSCAddress(): Promise<string[]> {
    return this.thresh0ldService.generateDepositAddress({
      walletSecret: AppConstants.THRESHOLD_BSC_WALLET_SECRET,
      walletCode: AppConstants.THRESHOLD_BSC_WALLET_CODE,
      walletId: AppConstants.THRESHOLD_BSC_WALLET_ID,
    });
  }
  generateCliqTokenAddress(): Promise<string[]> {
    return this.thresh0ldService.generateDepositAddress({
      walletSecret: AppConstants.THRESHOLD_CLIQ_TOKEN_WALLET_SECRET,
      walletCode: AppConstants.THRESHOLD_CLIQ_TOKEN_WALLET_CODE,
      walletId: AppConstants.THRESHOLD_CLIQ_TOKEN_WALLET_ID,
    });
  }

  // generateETHAddress(): Promise<string[]> {
  //   return this.thresh0ldService.generateDepositAddress({
  //     walletSecret: AppConstants.THRESHOLD_ETH_WALLET_SECRET,
  //     walletCode: AppConstants.THRESHOLD_ETH_WALLET_CODE,
  //     walletId: AppConstants.THRESHOLD_ETH_WALLET_ID,
  //   });
  // }
}
