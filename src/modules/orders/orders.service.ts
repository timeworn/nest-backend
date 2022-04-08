import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, getRepository, Repository } from 'typeorm';
import { AppEvents } from '../../constants/events';
import { PaystackService } from '../../integrations/paystack';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { NotificationTypes } from '../../notifications/enum/notification-types.enum';
import { ReferralTask } from '../referral-tasks/entities/referral-task.entity';
import { ReferralTaskStatus } from '../referral-tasks/enums/referral-task-status.enum';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { AppCurrency } from '../../shared/enums/app-currency.enum';
import GlobalOperations from '../../shared/global';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { LogisticsService } from '../logistics/logistics.service';
import { RequestEntity } from '../requests/entities/request.entity';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { RequestsService } from '../requests/requests.service';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { Review } from '../reviews/entities/review.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionOperations, TransactionStatus, TransactionTypes } from '../transactions/enums/transactions.enum';
import { TransactionMetadata } from '../transactions/interfaces/transaction-meta';
import { User } from '../users/entities/user.entity';
import { UtilitiesService } from '../utilities/utilities.service';
import { Wallet } from '../wallets/entities/wallet.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { ReferralsService } from '../referrals/referrals.service';

@Injectable()
export class OrdersService extends AbstractService<Order> {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly requestsService: RequestsService,
    private readonly logisticsService: LogisticsService,
    private readonly connection: Connection,
    private readonly eventEmitter: EventEmitter2,
    private readonly paystackService: PaystackService,
    private readonly utilitiesService: UtilitiesService,
    private readonly referralsService: ReferralsService,
  ) {
    super();
    this.repository = this.orderRepo;
    this.modelName = 'Order';
  }

  async create(createOrderDto: CreateOrderDto, user: User) {
    // const orderdata = await this.processOrder(createOrderDto, user);
    // const { request } = orderdata;
    // const order = await super.create(orderdata);

    // request.order = order;
    // await request.save();

    // return this.findOne(order.id);
    const order = new Order();
    return order;
  }

  findOne(id: string) {
    const query = this.orderRepo.createQueryBuilder('root');

    // query.where('root.customerId = :customerId', { customerId: user.id });

    query.where('root.id = :id', { id });

    query.leftJoinAndSelect('root.request', 'request');

    query.leftJoinAndSelect('request.product', 'product');

    query.leftJoinAndSelect('request.customer', 'customerr');

    query.leftJoinAndSelect('request.vendor', 'vendorr');

    query.leftJoinAndSelect('product.user', 'user');

    query.leftJoinAndSelect('root.customer', 'customer');

    query.leftJoinAndSelect('root.vendor', 'vendor');
    // customerTransaction

    query.leftJoinAndSelect('root.transaction', 'transaction');
    query.leftJoinAndSelect('root.customerTransaction', 'customerTransaction');

    // query.orderBy('root.createdAt', 'DESC');

    return query.getOne();
  }

  async findAll(pagination: AbstractPaginationDto, user: User) {
    const query = this.orderRepo.createQueryBuilder('root');

    query.where('root.customerId = :customerId', { customerId: user.id });

    query.orWhere('root.vendorId = :vendorId', { vendorId: user.id });

    query.leftJoinAndSelect('root.request', 'request');

    query.leftJoinAndSelect('request.product', 'product');

    query.leftJoinAndSelect('request.customer', 'customerr');

    query.leftJoinAndSelect('request.vendor', 'vendorr');

    query.leftJoinAndSelect('product.user', 'user');

    query.leftJoinAndSelect('root.customer', 'customer');

    query.leftJoinAndSelect('root.vendor', 'vendor');

    query.leftJoinAndSelect('root.transaction', 'transaction');

    query.orderBy('root.createdAt', 'DESC');

    const response = await Helper.paginateItems(query, pagination);

    const data = [];

    const reviews = await getRepository(Review).find({ where: { userId: user.id } });

    for (const order of response.data) {
      // data.push(await order.toDto(user));
      const review = reviews.find((x) => x.orderId == order.id);
      const hasReviewed = review ? true : false;
      data.push({
        ...order,
        hasReviewed,
        review,
      });
    }

    return {
      data,
      pagination: response.pagination,
    };
  }

  async createWithCard(createOrderDto: CreateOrderDto, user: User) {
    const { requestId } = createOrderDto;

    const request = await this.requestsService.findOne(requestId);

    const orderdata = await this.processOrder(request, createOrderDto, user);

    await GlobalOperations.verifyTransactionPin(createOrderDto, user);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const metadata: Partial<TransactionMetadata> = {
        recipient: request.product.user.fullName,
        transactionFee: orderdata.charges.serviceCharge,
        username: request.product.user.username,
      };

      const serviceCharge = await GlobalOperations.convertCurrency({
        amount: orderdata.charges.serviceCharge,
        baseCurrency: request.product.currency,
        targetCurrency: AppCurrency.NAIRA,
      });

      const actualAmount = await GlobalOperations.convertCurrency({
        amount: orderdata.totalAmount,
        baseCurrency: request.product.currency,
        targetCurrency: AppCurrency.NAIRA,
      });

      console.log({
        prevAmount: orderdata.totalAmount,
        actualAmount,
      });

      const transaction = queryRunner.manager.create(Transaction, {
        amount: Math.ceil(actualAmount),
        currency: AppCurrency.NAIRA,
        method: 'card',
        operation: TransactionOperations.PRODUCT_PURCHASE,
        userId: user.id,
        type: TransactionTypes.PAYMENT_TRANSACTION,
        reference: Helper.faker.datatype.uuid(),
        walletId: null,
        status: TransactionStatus.PENDING,
        metadata: { ...metadata, previousBalance: 0, currentBalance: 0, other: { ...orderdata, requestId } } ?? {},
      });

      await queryRunner.manager.save(transaction);

      await queryRunner.manager.update(Transaction, { id: transaction.id }, { metadata: { ...transaction.metadata, transactionFee: serviceCharge } });

      // const order = queryRunner.manager.create(Order, {
      //   ...orderdata,
      //   status: 'Awaiting Payment',
      //   currency: request.product.currency,
      //   statusTimeline: ['Awaiting Payment'],
      // });

      // await queryRunner.manager.save(order);

      // await queryRunner.manager.update(RequestEntity, { id: request.id }, { completed: true });

      // await queryRunner.manager.update(RequestEntity, { id: request.id }, { orderId: order.id });

      // order.request = request;

      // await queryRunner.manager.save(order);

      const paystackTransaction = await this.paystackService.initializeTransaction({
        email: user.email,
        amount: Math.ceil(actualAmount),
      });

      await queryRunner.manager.update(
        Transaction,
        { id: transaction.id },
        { accessCode: paystackTransaction.access_code, serverMetadata: paystackTransaction, reference: paystackTransaction.reference },
      );

      await queryRunner.commitTransaction();

      return {
        order: {
          ...orderdata,
          hasReviewed: false,
          request,
          customer: user,
          vendor: request.vendor,
          transaction,
          customerTransactionId: transaction.id,
          customerTransaction: transaction,
          createdAt: new Date().toISOString(),
        },
        paystackTransaction,
      };

      // return this.findOne(order.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async createWithWallet(createOrderDto: CreateOrderDto, user: User) {
    const { walletId, requestId } = createOrderDto;

    const request = await this.requestsService.findOne(requestId);

    await GlobalOperations.verifyTransactionPin(createOrderDto, user);

    const query = getRepository(Wallet)
      .createQueryBuilder('root')
      .leftJoinAndSelect('root.walletType', 'walletType')
      .where('walletType.currency = :currency', { currency: request.product.currency })
      .andWhere('root.userId = :userId', { userId: request.product.userId });

    const vendorWallet = await query.getOne();

    if (!vendorWallet) throw new BadRequestException('Vendor cannot receive payment');

    const orderdata = await this.processOrder(request, createOrderDto, user);

    // const { wallet, actualAmount } = await GlobalOperations.checkUserBalance({
    //   userId: user.id,
    //   amount: orderdata.totalAmount,
    //   walletId,
    //   currency: request.product.currency,
    // });

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // await queryRunner.manager.update(Wallet, { id: walletId }, { balance: wallet.balance - actualAmount });

      const metadata: Partial<TransactionMetadata> = {
        recipient: request.product.user.fullName,
        transactionFee: orderdata.charges.serviceCharge,
        username: request.product.user.username,
      };

      const { transaction, wallet } = await GlobalOperations.chargeWallet(queryRunner, {
        amount: orderdata.totalAmount,
        currency: request.product.currency,
        userId: user.id,
        walletId,
        metadata,
        walletType: null,
      });

      const serviceCharge = await GlobalOperations.convertCurrency({
        amount: orderdata.charges.serviceCharge,
        baseCurrency: request.product.currency,
        targetCurrency: wallet.walletType.currency,
      });

      await queryRunner.manager.update(Transaction, { id: transaction.id }, { metadata: { ...transaction.metadata, transactionFee: serviceCharge } });

      const order = queryRunner.manager.create(Order, {
        ...orderdata,
        status: 'Processing',
        currency: request.product.currency,
        customerTransactionId: transaction.id,
        statusTimeline: ['Deal Completed', 'Processing'],
      });

      await queryRunner.manager.save(order);

      await queryRunner.manager.update(RequestEntity, { id: request.id }, { completed: true });

      // order.request = request;
      order.requestId = request.id;

      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      // const query = this.orderRepo.createQueryBuilder('root');

      // query.where('root.customerId = :customerId', { customerId: user.id });

      // query.andWhere('root.id = :id', { id: order.id });

      // query.leftJoinAndSelect('root.request', 'request');

      // query.leftJoinAndSelect('request.product', 'product');

      // query.leftJoinAndSelect('root.customer', 'customer');

      // query.leftJoinAndSelect('root.vendor', 'vendor');

      // query.leftJoinAndSelect('root.transaction', 'transaction');

      const result = await this.findOne(order.id);

      const notification: CreateNotificationDto = {
        createdById: user.id,
        createdForId: user.id,
        recordId: result.id,
        metaData: result,
        type: NotificationTypes.ORDER_MADE,
      };

      const notification2: CreateNotificationDto = {
        createdById: user.id,
        createdForId: request.vendorId,
        recordId: result.id,
        metaData: result,
        type: NotificationTypes.ORDER_REQUEST_RECEIVED,
      };

      this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);
      this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification2);

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async processOrder(request: RequestEntity, createOrderDto: CreateOrderDto, user: User) {
    const { requestId, logisticsId, deliveryLocation, paymentMethod } = createOrderDto;

    if (request.completed) {
      throw new BadRequestException('Cannot place order on completed request');
    }

    // const request = await this.requestsService.findOne(requestId);
    let deliveryFee = 0;
    let totalAmount = 0;
    let subTotal = 0;

    const { customerId } = request;

    if (user.id != customerId) throw new BadRequestException("Cannot create an order for a request that does't belong to you");

    if (request.status != RequestStatus.Accepted) throw new BadRequestException("Cannot create an order for a request that isn't accepted");

    if (logisticsId) {
      const fareInfo = await this.logisticsService.fetchFareByLogistic(logisticsId, {
        deliveryLatitude: deliveryLocation.lat,
        deliveryLongitude: deliveryLocation.lng,
        // pickupLatitude: request.product.lat,
        // pickupLongitude: request.product.lng,
        productId: request.productId,
      });

      deliveryFee = fareInfo.fare;
      // await this.logisticsService.findOne(logisticsId);
      // deliveryFee = 3500;
    }

    subTotal = request.actualAmount;

    console.log({ subTotal });
    console.log({ deliveryFee });

    totalAmount = subTotal + deliveryFee;

    const fee = await this.utilitiesService.fees({
      operation: 'new_order',
      paymentMethod,
    });

    let serviceCharge = 0;

    console.log({ totalAmount });

    if (fee.isPercentage) {
      serviceCharge = (fee.fee / 100) * totalAmount;

      console.log({ serviceCharge });

      serviceCharge = serviceCharge > fee.feeCap ? fee.feeCap + fee.additionalFee : serviceCharge + fee.additionalFee;

      console.log({ serviceCharge });
    } else {
      serviceCharge = fee.fee;
    }

    // const serviceCharge = 0.035 * totalAmount;

    totalAmount += serviceCharge;

    console.log({ totalAmount });

    const orderdata: Partial<Order> = {
      requestId,
      totalAmount,
      orderNumber: Helper.randomNumber(10),
      subTotal,
      charges: {
        serviceCharge,
      },
      deliveryFee,
      quantity: request.hasCustomOffer ? request.customOffer.quantity : request.quantity,
      customerId: user.id,
      vendorId: request.vendorId,
      logisticsId,
      currency: request.product.currency,
      deliveryLocation: {
        type: 'Point',
        coordinates: [deliveryLocation.lng, deliveryLocation.lat],
      },
      pickupLocation: request.product.location,
      status: 'Awaiting payment',
      statusTimeline: ['Awaiting payment'],
    };

    return orderdata;
  }

  async completeOrder(id: string, user: User) {
    const order = await this.findOne(id);

    const { customerId, customerStatus, vendor } = order;

    if (user.id != customerId) throw new BadRequestException('Cannot complete an order that doesnt belong to you');

    if (customerStatus != 'Processing') throw new BadRequestException("Cannot complete an order that isn't processing");

    const query = getRepository(Wallet)
      .createQueryBuilder('root')
      .leftJoinAndSelect('root.walletType', 'walletType')
      .where('walletType.currency = :currency', { currency: order.currency })
      .andWhere('root.userId = :userId', { userId: order.vendorId });

    const vendorWallet = await query.getOne();

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(Wallet, { id: vendorWallet.id }, { balance: vendorWallet.balance + order.subTotal });

      const transaction2 = queryRunner.manager.create(Transaction, {
        amount: order.subTotal,
        currency: vendorWallet.walletType.currency,
        method: 'wallet',
        operation: TransactionOperations.CREDIT,
        userId: vendorWallet.userId,
        type: TransactionTypes.WALLET_TRANSACTION,
        reference: Helper.faker.datatype.uuid(),
        walletId: vendorWallet.id,
        status: TransactionStatus.SUCCESSFUL,
        metadata: {
          recipient: user.fullName,
          transactionFee: 0,
          username: user.username,
          previousBalance: vendorWallet.balance,
          currentBalance: vendorWallet.balance + order.subTotal,
        },
      });

      await this.referralsService.processReferral(order, vendor, transaction2);

      // let serviceCharge = order.charges.serviceCharge;

      // if (order.transaction.method == 'card') serviceCharge = serviceCharge - 150;

      // console.log({ hasFee: serviceCharge });

      // refferalTask.

      await queryRunner.manager.save(transaction2);

      await queryRunner.manager.update(
        Order,
        { id: order.id },
        { transactionId: transaction2.id, customerStatus: 'Completed', status: 'Completed', statusTimeline: [...order.statusTimeline, 'Completed'] },
      );

      await queryRunner.commitTransaction();

      // const query = this.orderRepo.createQueryBuilder('root');

      // query.where('root.customerId = :customerId', { customerId: user.id });

      // query.andWhere('root.id = :id', { id: order.id });

      // query.leftJoinAndSelect('root.request', 'request');

      // query.leftJoinAndSelect('request.product', 'product');

      // query.leftJoinAndSelect('root.customer', 'customer');

      // query.leftJoinAndSelect('root.vendor', 'vendor');

      // query.leftJoinAndSelect('root.transaction', 'transaction');

      const data = await this.findOne(order.id);

      const notification: CreateNotificationDto = {
        createdById: user.id,
        createdForId: order.vendorId,
        recordId: data.id,
        metaData: data,
        type: NotificationTypes.ORDER_DELIVERED,
      };

      this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

      this.refreshOrder(data, user);

      return data;

      // return data;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }

    // return {};
  }

  async dispatchOrder(id: string, user: User) {
    const order = await this.findOne(id);

    const { vendorId, status } = order;

    if (user.id != vendorId) throw new BadRequestException('Cannot dispatch an order that doesnt belong to you');

    if (status != 'Processing') throw new BadRequestException("Cannot dispatch an order that isn't processing");

    await this.orderRepo.update(id, { status: 'Ongoing', statusTimeline: [...order.statusTimeline, 'Ongoing'] });

    const query = this.orderRepo.createQueryBuilder('root');

    // query.where('root.vendorId = :vendorId', { vendorId: user.id });

    // query.andWhere('root.id = :id', { id: order.id });

    // query.leftJoinAndSelect('root.request', 'request');

    // query.leftJoinAndSelect('request.product', 'product');

    // query.leftJoinAndSelect('root.customer', 'customer');

    // query.leftJoinAndSelect('root.vendor', 'vendor');

    // query.leftJoinAndSelect('root.transaction', 'transaction');

    const data = await this.findOne(order.id);

    const notification: CreateNotificationDto = {
      createdById: vendorId,
      createdForId: order.customerId,
      recordId: data.id,
      metaData: data,
      type: NotificationTypes.ORDER_DISPATCHED,
    };

    this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

    this.refreshOrder(data, user);

    return data;
  }

  async reviewOrder(id: string, createReviewDto: CreateReviewDto, user: User) {
    let order = await this.findOne(id);

    const { customerId, customerStatus } = order;

    if (user.id != customerId) throw new BadRequestException('Cannot review an order that doesnt belong to you');

    if (customerStatus != 'Completed') throw new BadRequestException("Cannot review an order that isn't completed");

    let review = await getRepository(Review).findOne({ where: { userId: user.id, orderId: id } });

    if (review) throw new BadRequestException('You have reviewed this order already');

    review = getRepository(Review).create({ ...createReviewDto, userId: user.id, orderId: id, productId: order.request.productId });

    await getRepository(Review).save(review);

    order = await this.findOne(id);

    // this.refreshOrder(order);

    return order.toDto(user);
  }

  async refreshOrder(order: Order, user: User) {
    this.eventEmitter.emit(AppEvents.REFRESH_ORDER, { order, user });
  }
}
