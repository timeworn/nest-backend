import { BadRequestException, Injectable } from '@nestjs/common';
import { Thresh0ldRequest } from '.';
import * as ETHConverter from 'ether-converter';
import { AppConstants } from '../../constants';

export class Thresh0ldService {
  async generateDepositAddress({
    walletSecret,
    walletId,
    walletCode,
    count = 1,
  }: {
    walletSecret: string;
    walletId: number;
    walletCode: string;
    count?: number;
  }): Promise<string[]> {
    const url = `/v1/sofa/wallets/${walletId}/addresses`;
    let result: any;
    try {
      result = await Thresh0ldRequest.post({
        data: { count: 1 },
        walletSecret,
        walletCode,
        url,
      });
    } catch (e) {
      // console.log(e.response.data);
      throw e.response.data;
      // throw new BadRequestException('Something went wrong');
    }

    return result.data.addresses;
  }

  async getNetworkFees({ walletSecret, walletId, walletCode }: { walletSecret: string; walletId: string; walletCode: string }) {
    try {
      const url = `/v1/sofa/wallets/${walletId}/autofee`;
      const result = await Thresh0ldRequest.post({
        walletSecret,
        walletCode,
        url,
        data: {
          block_num: 3,
        },
      });
      const fees = ETHConverter(result.data.auto_fee, 'wei');
      return {
        wei: result.data.auto_fee,
        eth: fees.ether,
      };
    } catch (e) {
      throw new BadRequestException(e.response.data);
    }
  }

  async processWithdrawal(
    {
      order_id,
      address,
      amount,
      user_id,
      fee,
    }: {
      order_id: string;
      address: string;
      amount: string;
      user_id: string;
      fee: any;
    },
    {
      walletSecret,
      walletId,
      walletCode,
    }: {
      walletSecret: string;
      walletId: string;
      walletCode: string;
    },
  ) {
    const url = `/v1/sofa/wallets/${walletId}/sender/transactions`;
    try {
      const request = await Thresh0ldRequest.post({
        data: {
          requests: [
            {
              order_id: `${AppConstants.THRESHOLD_ORDER_ID}${order_id.split('-').join('_')}`,
              address: address,
              amount: amount,
              user_id: user_id,
              message: 'SpottR withdrawal',
              block_average_fee: 3,
            },
          ],
        },
        walletSecret,
        walletCode,
        url,
      });
      return request;
    } catch (e) {
      console.log(e.response);
      throw new BadRequestException("We couldn't process your withdrawal");
    }
  }

  async withdrawCliqToken(data: { order_id: string; address: string; amount: string; user_id: string; fee: any }) {
    return await this.processWithdrawal(
      {
        address: data.address,
        user_id: data.user_id,
        order_id: data.order_id,
        amount: data.amount.toString(),
        fee: data.fee,
      },
      {
        walletId: AppConstants.THRESHOLD_MAIN_WALLET_ID.toString(),
        walletCode: AppConstants.THRESHOLD_MAIN_WALLET_CODE,
        walletSecret: AppConstants.THRESHOLD_MAIN_WALLET_SECRET,
      },
    );
  }
}
