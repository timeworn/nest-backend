import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getRepository, QueryRunner } from 'typeorm';
import { AppConstants } from '../../constants';
import { LatokenTickerModel } from '../../integrations/latoken/models/latoken-ticker.model';
import { Setting } from '../../modules/settings/entities/setting.entity';
import { Transaction } from '../../modules/transactions/entities/transaction.entity';
import { TransactionOperations, TransactionStatus, TransactionTypes } from '../../modules/transactions/enums/transactions.enum';
import { User } from '../../modules/users/entities/user.entity';
import { WalletTypes } from '../../modules/wallet-types/enums/wallet-types.enum';
import { Wallet } from '../../modules/wallets/entities/wallet.entity';
import { AppCurrency } from '../enums/app-currency.enum';
import { Helper } from '../helpers';
import RedisStore from '../plugins/redis';

export default class GlobalOperations {
  static async checkUserBalance({
    userId,
    walletType,
    amount,
    currency,
    walletId,
  }: {
    userId: string;
    walletType?: WalletTypes;
    amount: number;
    currency: string;
    walletId?: string;
  }): Promise<{ wallet: Wallet; actualAmount: number }> {
    let wallet: Wallet;

    if (walletId) {
      wallet = await getRepository(Wallet).findOne({ where: { userId, id: walletId } });
    } else {
      const userWallets = await getRepository(Wallet).find({ where: { userId } });
      wallet = userWallets.find((x) => x.walletType.slug == walletType);
    }

    if (!wallet) throw new NotFoundException(`No ${walletType} wallet registered for this user`);
    //console.log(`${wallet.walletType.slug} balance in ${wallet.id} is ${wallet.balance}`);

    const actualAmount = await GlobalOperations.convertCurrency({
      amount,
      baseCurrency: currency,
      targetCurrency: wallet.walletType.currency,
    });

    console.log('Actual amount to pay is ', actualAmount);
    console.log('Wallet balance is  ', wallet.balance);

    if (wallet.balance < actualAmount) throw new BadRequestException('Insufficient balance');

    return { wallet, actualAmount };
  }

  static async verifyTransactionPin(payload: Record<string, any>, user: User) {
    const { transactionPin } = payload;
    //console.log('body is', payload);
    //console.log(`verifying transaction pin ${transactionPin} for ${user.firstName}`);
    const settings = await getRepository(Setting).findOne({
      where: { userId: user.id },
    });

    if (!(await Helper.compare(transactionPin, settings.transactionPin))) throw new UnauthorizedException('Invalid transaction pin');

    return true;
  }

  static async chargeWallet(
    queryRunner: QueryRunner,
    {
      userId,
      amount,
      walletType,
      metadata,
      currency,
      walletId,
      status,
    }: {
      userId: string;
      amount: number;
      walletType: WalletTypes;
      metadata: Record<string, any>;
      currency: string;
      walletId?: string;
      status?: TransactionStatus;
    },
  ): Promise<{ wallet: Wallet; transaction: Partial<Transaction> }> {
    const { wallet, actualAmount } = await GlobalOperations.checkUserBalance({
      userId,
      walletType: walletType ?? WalletTypes.CLIQ_TOKEN,
      amount,
      currency,
      walletId,
    });
    await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: wallet.balance - actualAmount });

    const transaction = queryRunner.manager.create(Transaction, {
      amount: actualAmount,
      currency: wallet.walletType.currency,
      method: 'wallet',
      operation: TransactionOperations.DEBIT,
      userId,
      type: TransactionTypes.WALLET_TRANSACTION,
      reference: Helper.faker.datatype.uuid(),
      walletId: wallet.id,
      status: status ?? TransactionStatus.SUCCESSFUL,
      metadata: { ...metadata, previousBalance: wallet.balance, currentBalance: wallet.balance - actualAmount } ?? {},
    });

    await queryRunner.manager.save(transaction);

    return { wallet, transaction };

    // wallet.balance = wallet.balance - actualAmount;

    // await wallet.save();

    // const { walletType: walletTypeData } = wallet;

    // await getRepository(Transaction).save({
    //   amount: actualAmount,
    //   currency: walletTypeData.currency,
    //   method: 'wallet',
    //   operation: TransactionOperations.DEBIT,
    //   userId,
    //   type: TransactionTypes.WALLET_TRANSACTION,
    //   reference: Helper.faker.datatype.uuid(),
    //   walletId: wallet.id,
    //   status: TransactionStatus.SUCCESSFUL,
    //   metadata: metadata ?? {},
    // });
  }

  static async convertCurrency({
    amount,
    baseCurrency,
    targetCurrency,
  }: {
    amount: number;
    baseCurrency: string;
    targetCurrency: string;
  }): Promise<number> {
    if (baseCurrency == targetCurrency) return amount;

    let rates = await Helper.currencyRates();

    let actualAmount = 0;

    // await RedisStore.connect();

    const response = await RedisStore.get('cliq_token_ticker');

    const cliqTokenTicker: LatokenTickerModel = JSON.parse(response.data) as LatokenTickerModel;

    const usdRate = rates['NGN'];

    if (baseCurrency == AppCurrency.NAIRA && targetCurrency == AppCurrency.CLIQ_TOKEN) {
      const usdValue = amount / usdRate;

      actualAmount = usdValue / Number(cliqTokenTicker.lastPrice);
    }

    if (baseCurrency == AppCurrency.CLIQ_TOKEN && targetCurrency == AppCurrency.NAIRA) {
      const usdValue = amount * Number(cliqTokenTicker.lastPrice);

      const nairaValue = usdRate * usdValue;

      actualAmount = nairaValue;
    }

    let data = {};

    data[baseCurrency] = {
      amount,
    };

    data[targetCurrency] = {
      actualAmount,
    };

    console.log(data);

    console.log({ usdRate, ctValue: cliqTokenTicker.lastPrice, actualAmount });

    // throw new BadRequestException('nenoednend0endon');

    return actualAmount;
  }
}
