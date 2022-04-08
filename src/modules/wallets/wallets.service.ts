import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getRepository, Not, Repository } from 'typeorm';
import { AppConstants } from '../../constants';
import { AppEvents } from '../../constants/events';
import { LatokenTickerModel } from '../../integrations/latoken/models/latoken-ticker.model';
import { PaystackService } from '../../integrations/paystack';
import { Thresh0ldService } from '../../integrations/thresh0ld/thresh0ld.service';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { NotificationTypes } from '../../notifications/enum/notification-types.enum';
import { AppCurrency } from '../../shared/enums/app-currency.enum';
import GlobalOperations from '../../shared/global';
import { Helper } from '../../shared/helpers';
import RedisStore from '../../shared/plugins/redis';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { BankAccount } from '../bank-accounts/entities/bank-account.entity';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionOperations, TransactionStatus, TransactionTypes } from '../transactions/enums/transactions.enum';
import { TransactionMetadata } from '../transactions/interfaces/transaction-meta';
import { User } from '../users/entities/user.entity';
import { UtilitiesService } from '../utilities/utilities.service';
import { WalletTypes } from '../wallet-types/enums/wallet-types.enum';
import { FundFiatWallet } from './dto/fund-fiat-wallet.dto';
import { WithdrawFromWalletDto } from './dto/withdraw-from-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { WithdrawalType } from './enums/withdrawal-type.enum';

@Injectable()
export class WalletsService extends AbstractService<Wallet> {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly paystackService: PaystackService,
    private readonly thresh0ldService: Thresh0ldService,
    private readonly eventEmitter: EventEmitter2,
    private redisCacheService: RedisCacheService,
  ) {
    super();
    this.repository = this.walletRepo;
    this.modelName = 'Wallet';
  }

  // list(user: User) {
  //   return this.walletRepo.find({ where: { userId: user.id } });
  // }

  async list(user: User): Promise<any> {
    let currentBalance = 0;

    let rates = await Helper.currencyRates();

    let wallets = await this.walletRepo.find({ where: { userId: user.id } });

    wallets = wallets.filter((x) => x.walletType.status == 'Active');

    const fiatWallet = wallets.find((x) => x.walletType.slug == WalletTypes.FIAT_WALLET);
    currentBalance += fiatWallet.balance;

    const cliqTokenWallet = wallets.find((x) => x.walletType.slug == WalletTypes.CLIQ_TOKEN);

    const response = await this.redisCacheService.get('cliq_token_ticker');

    const cliqTokenTicker: LatokenTickerModel = response.data as LatokenTickerModel;

    console.log({ ctprice: cliqTokenTicker.lastPrice });

    currentBalance += cliqTokenWallet.balance * Number(cliqTokenTicker.lastPrice) * rates['NGN'];

    return {
      currentBalance,
      wallets: wallets.map((x) => {
        let ctValue: number = 0;

        switch (x.walletType.slug) {
          case WalletTypes.CLIQ_TOKEN:
            ctValue = x.balance;
            break;
          case WalletTypes.FIAT_WALLET:
            ctValue = x.balance / rates['NGN'] / Number(cliqTokenTicker.lastPrice);
            break;
          default:
            break;
        }

        return {
          ...x,
          ctValue,
          change24h: cliqTokenTicker.change24h,
        };
      }),
    };
  }

  async fundFiatWallet(fundFiatWallet: FundFiatWallet, user: User) {
    // const { amount } = fundFiatWallet;

    let payAmount = fundFiatWallet.amount;

    if (payAmount < 100) throw new BadRequestException('Amount cannot be less than NGN 100');

    const query = this.walletRepo.createQueryBuilder('root');

    query.leftJoinAndSelect('root.walletType', 'walletType');
    query.leftJoinAndSelect('root.user', 'user');

    query.where('walletType.slug = :walletType', { walletType: 'fiat_wallet' });

    query.andWhere('root.userId = :userId', { userId: user.id });

    const wallet = await query.getOne();

    if (!wallet) throw new NotFoundException('Fiat wallet not found');

    const transactionFee = 150;

    payAmount += transactionFee;
    // payAmount += 0.02 * payAmount + 120;

    const paystackTransaction = await this.paystackService.initializeTransaction({
      email: user.email,
      amount: payAmount,
    });

    const transaction = await getRepository(Transaction).save({
      amount: Number(fundFiatWallet.amount),
      currency: AppCurrency.NAIRA,
      operation: TransactionOperations.CREDIT,
      type: TransactionTypes.PAYMENT_TRANSACTION,

      metadata: {
        recipient: 'Self',
        username: wallet.user.username,
        transactionFee,
        previousBalance: wallet.balance,
        currentBalance: wallet.balance,
      },
      serverMetadata: paystackTransaction,
      method: 'paystack',
      userId: user.id,
      accessCode: paystackTransaction.access_code,
      status: TransactionStatus.PENDING,
      reference: paystackTransaction.reference,
      walletId: wallet.id,
    });

    return { ...paystackTransaction, transactionId: transaction.id };
  }

  async withdrawToken(withdrawFromWalletDto: WithdrawFromWalletDto, user: User) {
    const { withdrawalType, walletId, amount, identifier, transactionPin } = withdrawFromWalletDto;

    await GlobalOperations.verifyTransactionPin({ transactionPin }, user);

    let userWallet = await getRepository(Wallet).findOne({ where: { id: walletId, userId: user.id } });

    if (withdrawalType == WithdrawalType.BANK_ACCOUNT) {
      if (!userWallet || userWallet.walletType.slug != WalletTypes.FIAT_WALLET) throw new NotFoundException('Wallet not found');
      userWallet.user = user;
      return this.withdrawFiat(withdrawFromWalletDto, userWallet);
    }

    if (!userWallet || userWallet.walletType.slug != WalletTypes.CLIQ_TOKEN) throw new NotFoundException('Wallet not found');

    let internalFee: number;
    let totalDebit: number;
    let cliqTokenUSDValue;

    const response = await RedisStore.get('cliq_token_ticker');

    const cliqTokenTicker: LatokenTickerModel = JSON.parse(response.data) as LatokenTickerModel;

    cliqTokenUSDValue = Number(cliqTokenTicker.lastPrice);

    if (withdrawalType == WithdrawalType.WALLET_ADDRESS) {
      internalFee = (0.1 / 100) * amount;
      const NetworkFee = await this.thresh0ldService.getNetworkFees({
        walletId: AppConstants.THRESHOLD_MAIN_WALLET_ID.toString(),
        walletCode: AppConstants.THRESHOLD_MAIN_WALLET_CODE,
        walletSecret: AppConstants.THRESHOLD_MAIN_WALLET_SECRET,
      });

      console.log({ NetworkFee });

      const ethNetworkFee = NetworkFee.eth;

      const weiNetworkFee = NetworkFee.wei;

      const ethUSDRate = (await Helper.getCurrencyValue(AppCurrency.BSC)).data.USD;

      console.log({ ethUSDRate });

      const USDNetworkFee = Number(ethNetworkFee) * ethUSDRate;

      const CTNetworkFee = USDNetworkFee / cliqTokenUSDValue;

      totalDebit = amount + CTNetworkFee + internalFee;

      if (userWallet.balance < totalDebit) throw new BadGatewayException('Insufficient funds');

      try {
        const thresh0ldWithdrawalId = Helper.faker.datatype.uuid();
        const threshOldTransaction = await this.thresh0ldService.withdrawCliqToken({
          order_id: thresh0ldWithdrawalId,
          address: identifier,
          amount: amount.toString(),
          user_id: userWallet.userId,
          fee: weiNetworkFee,
        });

        console.log(threshOldTransaction.data.results);

        userWallet = await getRepository(Wallet).findOne({ where: { id: walletId, userId: user.id } });

        const metadata: Partial<TransactionMetadata> = {
          recipient: 'Self',
          transactionFee: CTNetworkFee,
          username: identifier,
          previousBalance: userWallet.balance,
          currentBalance: userWallet.balance - totalDebit,
        };

        userWallet.balance -= totalDebit;

        await userWallet.save();

        const transaction = await getRepository(Transaction).save({
          amount: Number(amount),
          currency: AppCurrency.CLIQ_TOKEN,
          operation: TransactionOperations.DEBIT,
          type: TransactionTypes.WALLET_TRANSACTION,
          metadata: metadata,
          serverMetadata: threshOldTransaction.data.results,
          method: 'cliq_token',
          userId: userWallet.userId,
          // accessCode: paystackTransaction.access_code,
          status: TransactionStatus.PENDING,
          reference: `${AppConstants.THRESHOLD_ORDER_ID}${thresh0ldWithdrawalId.split('-').join('_')}`,
          walletId: userWallet.id,
        });

        this.eventEmitter.emit('wallet.refresh', userWallet.userId);

        // const notification: CreateNotificationDto = {
        //   createdById: user.id,
        //   createdForId: user.id,
        //   recordId: transaction.id,
        //   metaData: transaction,
        //   type: NotificationTypes.WITHDRAWAL,
        // };

        // this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

        return transaction;

        // return threshOldTransaction.data;
      } catch (error) {
        throw new BadRequestException('Cannot withdraw at this time, please try again later', error);
      }
    }

    if (withdrawalType == WithdrawalType.SPOTTR_USER) {
      const receiver = await getRepository(User).findOne({ where: { id: identifier } });

      if (!receiver) throw new BadRequestException('User not found');

      if (receiver.id == user.id) throw new BadRequestException('You cannot send money to yourself');

      const query = getRepository(Wallet)
        .createQueryBuilder('root')
        .leftJoinAndSelect('root.walletType', 'walletType')
        .leftJoinAndSelect('root.user', 'user')
        .where('walletType.slug = :slug', { slug: 'cliq_token' })
        .andWhere('root.userId = :userId', { userId: receiver.id });

      let receiverWallet = await query.getOne();

      if (!receiverWallet) throw new NotFoundException('Wallet does not exist');

      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const receiverMetadata: Partial<TransactionMetadata> = {
        recipient: receiverWallet.user.fullName,
        transactionFee: 0,
        username: receiverWallet.user.username,
      };

      try {
        const { transaction: senderTransaction } = await GlobalOperations.chargeWallet(queryRunner, {
          amount,
          metadata: receiverMetadata,
          userId: user.id,
          currency: AppCurrency.CLIQ_TOKEN,
          walletType: WalletTypes.CLIQ_TOKEN,
        });

        receiverWallet = await query.getOne();

        await queryRunner.manager.update(Wallet, { id: receiverWallet.id }, { balance: receiverWallet.balance + amount });

        const transaction = queryRunner.manager.create(Transaction, {
          amount,
          currency: AppCurrency.CLIQ_TOKEN,
          method: 'wallet',
          operation: TransactionOperations.CREDIT,
          userId: receiver.id,
          type: TransactionTypes.WALLET_TRANSACTION,
          reference: Helper.faker.datatype.uuid(),
          walletId: receiverWallet.id,
          status: TransactionStatus.SUCCESSFUL,
          metadata: {
            recipient: user.fullName,
            transactionFee: 0,
            username: user.username,
            previousBalance: receiverWallet.balance,
            currentBalance: receiverWallet.balance + amount,
          },
        });

        await queryRunner.manager.save(transaction);

        await queryRunner.commitTransaction();

        this.eventEmitter.emit('wallet.refresh', user.id);
        this.eventEmitter.emit('wallet.refresh', receiverWallet.userId);

        const notification: CreateNotificationDto = {
          createdById: user.id,
          createdForId: user.id,
          recordId: senderTransaction.id,
          metaData: senderTransaction.handleAfterLoad(),
          type: NotificationTypes.SENT_MONEY,
        };

        const notification2: CreateNotificationDto = {
          createdById: user.id,
          createdForId: receiverWallet.userId,
          recordId: transaction.id,
          metaData: transaction.handleAfterLoad(),
          type: NotificationTypes.RECEIVED_MONEY,
        };

        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);
        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification2);
        return transaction;
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(error);
      } finally {
        await queryRunner.release();
      }
    }
  }

  async withdrawFiat(withdrawFromWalletDto: WithdrawFromWalletDto, userWallet: Wallet) {
    const { identifier, amount } = withdrawFromWalletDto;
    const { userId, user } = userWallet;

    // await GlobalOperations.checkUserBalance({
    //   amount,
    //   currency: AppCurrency.NAIRA,
    //   userId,
    //   walletId: userWallet.id,
    // });

    const transactionFee = 150;

    const chargeAmount = amount + transactionFee;

    const bankAccount = await getRepository(BankAccount).findOne({ where: { userId, id: identifier } });

    if (!bankAccount) throw new NotFoundException('Account not found');

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const metadata: Partial<TransactionMetadata> = {
        recipient: `${bankAccount.accountNumber}\n${bankAccount.accountName}`,
        transactionFee,
        username: user.username,
      };

      const { transaction } = await GlobalOperations.chargeWallet(queryRunner, {
        amount: chargeAmount,
        currency: AppCurrency.NAIRA,
        userId,
        walletId: userWallet.id,
        metadata,
        walletType: WalletTypes.FIAT_WALLET,
        status: TransactionStatus.PENDING,
      });

      await this.paystackService.makeTransfer({
        amount,
        recipient: bankAccount.recipientCode,
        reference: transaction.reference,
      });

      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }
}
