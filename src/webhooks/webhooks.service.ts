import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Connection, getConnection, getRepository } from 'typeorm';
import { DepositAddress } from '../modules/deposit-address/entities/deposit-address.entity';
import { Transaction } from '../modules/transactions/entities/transaction.entity';
import { TransactionOperations, TransactionStatus, TransactionTypes } from '../modules/transactions/enums/transactions.enum';
import { Wallet } from '../modules/wallets/entities/wallet.entity';
import { PaystackResponse } from './dto/paystack.response';
import { Thresh0ldDepositResponse } from './dto/thresh0ld-deposit.response';
import axios from 'axios';
import { AppConstants } from '../constants';
import { AppCurrency } from '../shared/enums/app-currency.enum';
import { Helper } from '../shared/helpers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { NotificationTypes } from '../notifications/enum/notification-types.enum';
import { AppEvents } from '../constants/events';
import { Order } from '../modules/orders/entities/order.entity';
import { RequestEntity } from '../modules/requests/entities/request.entity';
import { OrdersService } from '../modules/orders/orders.service';
import { RequestsService } from '../modules/requests/requests.service';
import RedisStore from '../shared/plugins/redis';
import { LatokenTickerModel } from '../integrations/latoken/models/latoken-ticker.model';
// import { ReferralsService } from '../modules/referrals/referrals.service';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly connection: Connection,
    private readonly orderService: OrdersService,
    // private readonly referralsService: ReferralsService,
    private readonly requestsService: RequestsService,
  ) {}

  async handlePaystackWebhook(paystackResponse: PaystackResponse) {
    const {
      event,
      data: { reference, status, fees },
    } = paystackResponse;

    console.log('got paystack webhook', paystackResponse);

    // let transaction: Transaction;

    const transaction = await getRepository(Transaction).findOne({ where: { reference } });

    switch (event) {
      case 'charge.success':
        // transaction = await getRepository(Transaction).findOne({ where: { reference } });
        console.log({ transaction, status });

        if (!transaction || status != 'success') throw new BadRequestException('Failed transaction');

        if (transaction.status == TransactionStatus.SUCCESSFUL) throw new BadRequestException('Transaction treated');

        if (transaction.operation == TransactionOperations.PRODUCT_PURCHASE) {
          return this.handleOrderTransaction(transaction, fees / 100);
        }

        transaction.status = TransactionStatus.SUCCESSFUL;

        const wallet = await getRepository(Wallet).findOne({ where: { id: transaction.walletId } });

        transaction.metadata = {
          ...transaction.metadata,
          previousBalance: wallet.balance,
          currentBalance: wallet.balance + transaction.amount,
          transactionFee: transaction.metadata.transactionFee + fees / 100,
        };

        transaction.serverMetadata = paystackResponse;

        wallet.balance += transaction.amount;

        await transaction.save();
        await wallet.save();
        const notification: CreateNotificationDto = {
          createdById: transaction.userId,
          createdForId: transaction.userId,
          recordId: transaction.id,
          metaData: transaction.handleAfterLoad(),
          type: NotificationTypes.FUNDED_WALLET,
        };

        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);
        this.eventEmitter.emit('wallet.refresh', wallet.userId);
        break;

      case 'transfer.success':
        if (!transaction) throw new BadRequestException('Failed transaction');

        if (transaction.status == TransactionStatus.SUCCESSFUL) throw new BadRequestException('Transaction treated');

        transaction.serverMetadata = paystackResponse;

        transaction.status = TransactionStatus.SUCCESSFUL;

        transaction.metadata.transactionFee = transaction.metadata.transactionFee + fees;

        await transaction.save();

        const notification2: CreateNotificationDto = {
          createdById: transaction.userId,
          createdForId: transaction.userId,
          recordId: transaction.id,
          metaData: transaction.handleAfterLoad(),
          type: NotificationTypes.WITHDRAWAL,
        };

        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification2);
        break;
      default:
        break;
    }

    return {};
  }

  async handleThresh0ldWebhook(thresh0ldWebhook: Thresh0ldDepositResponse) {
    const { type, to_address, confirm_blocks, txid, currency, amount, decimal, token_address, fees, order_id } = thresh0ldWebhook;

    console.log({ thresh0ldWebhook });

    switch (type) {
      case 1:
        console.log(`processing ${Number(amount) / Math.pow(10, decimal)} deposit to ${to_address} with txid ${txid}`);

        if (confirm_blocks < 6) {
          throw new BadRequestException('Waiting for 6 confirmation');
        }

        let transaction = await getRepository(Transaction).findOne({ where: { reference: txid }, relations: ['user'] });

        console.log(transaction);

        if (transaction) throw new BadRequestException('Transaction treated');

        const depositAddress = await getRepository(DepositAddress).findOne({ where: { address: to_address } });

        console.log({ depositAddressCurrency: depositAddress.currency });

        if (!depositAddress) throw new BadRequestException('Receiver address is invalid');

        const query = getRepository(Wallet)
          .createQueryBuilder('root')
          .leftJoinAndSelect('root.walletType', 'walletType')
          .leftJoinAndSelect('root.user', 'user')
          .where('walletType.slug = :slug', { slug: 'cliq_token' })
          .andWhere('root.userId = :userId', { userId: depositAddress.userId });

        let wallet = await query.getOne();
        if (!wallet) throw new NotFoundException('Cliq token wallet not found ');

        let currencyValue: number;
        let depositAmount: number;
        let cliqTokenAmount: number;
        let cliqTokenFee: number;
        let cliqTokenValueInUSD: number;
        let method = currency;

        const response = await RedisStore.get('cliq_token_ticker');

        const cliqTokenTicker: LatokenTickerModel = JSON.parse(response.data) as LatokenTickerModel;

        cliqTokenValueInUSD = Number(cliqTokenTicker.lastPrice);

        if (currency == depositAddress.currency) {
          currencyValue = (await Helper.getCurrencyValue(currency)).data.USD;
          console.log({ currencyValue });
          depositAmount = Number(amount) / Math.pow(10, decimal);
          const feeAmount = Number(fees ?? 0) / Math.pow(10, decimal);
          console.log({ depositAmount });
          cliqTokenAmount = (depositAmount * currencyValue) / cliqTokenValueInUSD;
          cliqTokenFee = (feeAmount * currencyValue) / cliqTokenValueInUSD;
        } else if (
          (depositAddress.currency == AppCurrency.CLIQ_TOKEN && token_address.toLowerCase() == AppConstants.BSC_CONTRACT_ADDRESS.toLowerCase()) ||
          (depositAddress.currency == AppCurrency.BSC && token_address.toLowerCase() == AppConstants.BSC_CONTRACT_ADDRESS.toLowerCase())
        ) {
          method = AppCurrency.CLIQ_TOKEN;
          // depositAmount = Number(amount) / decimal;
          depositAmount = Number(amount) / Math.pow(10, decimal);
          cliqTokenAmount = depositAmount;
          // cliqTokenFee = Number(fees ?? 0);
          cliqTokenFee = Number(fees ?? 0) / Math.pow(10, decimal);
        } else {
          throw new BadRequestException('Could not process deposit request');
        }

        console.log({ cliqTokenAmount });

        const queryRunner = getConnection().createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          wallet = await query.getOne();
          await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: wallet.balance + cliqTokenAmount });

          const transaction = queryRunner.manager.create(Transaction, {
            amount: cliqTokenAmount,
            currency: AppCurrency.CLIQ_TOKEN,
            operation: TransactionOperations.CREDIT,
            type: TransactionTypes.WALLET_TRANSACTION,
            // metadata: thresh0ldDepositResponse,
            serverMetadata: thresh0ldWebhook,
            metadata: {
              recipient: 'Self',
              transactionFee: cliqTokenFee,
              username: wallet.user.username,
              previousBalance: wallet.balance,
              currentBalance: wallet.balance + cliqTokenAmount,
            },
            method: currency,
            userId: wallet.userId,
            // accessCode: paystackTransaction.access_code,
            status: TransactionStatus.SUCCESSFUL,
            reference: txid,
            walletId: wallet.id,
          });

          await queryRunner.manager.save(transaction);

          await queryRunner.commitTransaction();

          const notification: CreateNotificationDto = {
            createdById: transaction.userId,
            createdForId: transaction.userId,
            recordId: transaction.id,
            metaData: transaction.handleAfterLoad(),
            type: NotificationTypes.FUNDED_WALLET,
          };

          this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);
          this.eventEmitter.emit('wallet.refresh', wallet.userId);
        } catch (error) {
          await queryRunner.rollbackTransaction();
          throw new BadRequestException(error);
        } finally {
          await queryRunner.release();
        }

        break;

      case 2:
        console.log(`processing ${Number(amount) / Math.pow(10, decimal)} withdrawal to ${to_address} with txid ${txid}`);

        if (confirm_blocks < 6) {
          throw new BadRequestException('Waiting for 6 confirmation');
        }

        const transaction2 = await getRepository(Transaction).findOne({ where: { reference: order_id }, relations: ['user'] });

        console.log(transaction2);

        if (transaction2.status == TransactionStatus.SUCCESSFUL) throw new BadRequestException('Transaction treated');

        transaction2.status = TransactionStatus.SUCCESSFUL;

        await transaction2.save();

        const notification: CreateNotificationDto = {
          createdById: transaction2.userId,
          createdForId: transaction2.userId,
          recordId: transaction2.id,
          metaData: transaction2,
          type: NotificationTypes.WITHDRAWAL,
        };

        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

        break;
      default:
        throw new BadRequestException('Invalid webhook');
        break;
    }

    return {};
  }

  async handleOrderTransaction(transaction: Transaction, fees: number) {
    const orderdata: Record<string, any> = transaction.metadata.other;

    // const request = await getRepository(RequestEntity).findOne({ where: { id: orderdata.requestId } });
    const request = await this.requestsService.findOne(orderdata.requestId);

    delete orderdata.requestId;

    // const customerTransaction = orderdata.customerTransaction;

    // delete orderdata.customerTransaction;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let orderprev = queryRunner.manager.create(Order, {
        ...orderdata,
        status: 'Processing',
        customerTransactionId: transaction.id,
        // currency: transaction.currency,
        statusTimeline: [...orderdata.statusTimeline, 'Deal Completed', 'Processing'],
        transactionId: transaction.id,
      });

      let order = await queryRunner.manager.save(Order, orderprev);

      await queryRunner.manager.update(RequestEntity, { id: request.id }, { completed: true });

      // await getRepository(Order).update({ id: request.id }, { orderId: order.id });
      await queryRunner.manager.update(
        Transaction,
        { id: transaction.id },
        { status: TransactionStatus.SUCCESSFUL, metadata: { ...transaction.metadata, transactionFee: transaction.metadata.transactionFee + fees } },
      );

      // order.request = request;
      order.requestId = request.id;

      order = await queryRunner.manager.save(order);

      // order.customerTransaction = customerTransaction;

      // await this.referralsService.processReferral(order, order.customer, transaction);

      await queryRunner.commitTransaction();

      order = await this.orderService.findOne(order.id);

      setTimeout(() => {
        this.eventEmitter.emit(AppEvents.REFRESH_ORDER, { order, user: request.vendor });
        const notification: CreateNotificationDto = {
          createdById: transaction.userId,
          createdForId: transaction.userId,
          recordId: order.id,
          metaData: order,
          type: NotificationTypes.ORDER_MADE,
        };

        const notification2: CreateNotificationDto = {
          createdById: transaction.userId,
          createdForId: request.vendorId,
          recordId: order.id,
          metaData: order,
          type: NotificationTypes.ORDER_REQUEST_RECEIVED,
        };

        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);
        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification2);
      }, 10000);

      return {};
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  // getCurrencyValue(currency: string) {
  //   return axios({
  //     url: `https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=USD`,
  //     headers: {
  //       Authorization: `Apikey ${AppConstants.CRYPTO_COMPARE_API_KEY}`,
  //     },
  //   });
  // }
}
