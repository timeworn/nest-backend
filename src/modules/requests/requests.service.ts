import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { AppEvents } from '../../constants/events';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { NotificationTypes } from '../../notifications/enum/notification-types.enum';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { ConversationsService } from '../conversations/conversations.service';
import { Message } from '../messages/entities/message.entity';
import { ProductsService } from '../products/products.service';
import { SearchParticipant } from '../search-participants/entities/search-participant.entity';
import { User } from '../users/entities/user.entity';
import { AcceptRequestDto } from './dto/accept-request.dto';
import { CreateRequestDto, CreateRequestFromSearchDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { RequestEntity } from './entities/request.entity';
import { RequestStatus } from './enums/request-status.enum';

@Injectable()
export class RequestsService extends AbstractService<RequestEntity> {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepo: Repository<RequestEntity>,
    private readonly productsService: ProductsService,
    private readonly conversationsService: ConversationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    this.repository = this.requestRepo;
    this.modelName = 'Request';
  }

  async myRequests(user: User) {
    const received = await this.requestRepo.find({ where: { vendorId: user.id, completed: false }, order: { createdAt: 'DESC' } });
    const sent = await this.requestRepo.find({ where: { customerId: user.id, completed: false }, order: { createdAt: 'DESC' } });

    return { sent, received };
  }

  async MyRequests(user: User) {
    const query = this.requestRepo.createQueryBuilder('root');

    query.where('root.vendorId = :id', { id: user.id });
    query.andWhere('root.completed = :completed', { completed: false });
    // query.andWhere('root.completed is FALSE', { completed: false });

    query.leftJoinAndSelect('root.product', 'product');
    query.leftJoinAndSelect('product.user', 'user');
    query.leftJoinAndSelect('root.customer', 'customer');
    query.leftJoinAndSelect('root.vendor', 'vendor');
    // query.leftJoinAndSelect('customer.setting', 'setting');
    // query.leftJoinAndSelect('vendor.setting', 'setting');
    query.orderBy('root.createdAt', 'DESC');

    const received = await query.getMany();

    const query2 = this.requestRepo.createQueryBuilder('root');

    query2.where('root.customerId = :id', { id: user.id });
    query2.andWhere('root.completed = :completed', { completed: false });

    query2.leftJoinAndSelect('root.product', 'product');
    query2.leftJoinAndSelect('product.user', 'user');
    query2.leftJoinAndSelect('root.customer', 'customer');
    query2.leftJoinAndSelect('root.vendor', 'vendor');
    // query2.leftJoinAndSelect('customer.setting', 'setting');
    // query2.leftJoinAndSelect('vendor.setting', 'setting');
    query2.orderBy('root.createdAt', 'DESC');

    const sent = await query2.getMany();

    return { sent, received };
    // return { sent: [], received: [] };
  }

  async create(createRequestDto: CreateRequestDto, customer: User) {
    const { productId } = createRequestDto;

    const product = await this.productsService.findOne(productId);

    let request = await super.create({
      ...createRequestDto,
      customerId: customer,
      vendorId: product.userId,
    });

    request = await this.findOne(request.id);

    const notification: CreateNotificationDto = {
      createdById: customer.id,
      createdForId: product.userId,
      recordId: request.id,
      metaData: request,
      type: NotificationTypes.REQUEST_MADE,
    };

    this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

    return request;
  }

  async createFromSearch(createRequestFromSearchDto: CreateRequestFromSearchDto, customer: User) {
    const { searchParticipantId, quantity } = createRequestFromSearchDto;

    const participant = await getRepository(SearchParticipant).findOne({
      where: { id: searchParticipantId },
    });

    if (!participant) throw new NotFoundException('Invalid Search');

    const payload: Partial<RequestEntity> = {};

    payload.productId = participant.productId;
    payload.customerId = customer.id;
    payload.quantity = quantity;
    payload.vendorId = participant.product.user.id;
    payload.customerStatus = quantity ? RequestStatus.Pending : RequestStatus.Accepted;
    payload.vendorStatus = quantity ? RequestStatus.Pending : RequestStatus.Accepted;
    payload.status = quantity ? RequestStatus.Pending : RequestStatus.Accepted;
    payload.customOffer = null;

    const { hasCustomOffer } = participant;

    if (hasCustomOffer) {
      payload.customOffer = participant.customOffer;
      payload.quantity = participant.customOffer.quantity;
    }

    const request = await super.create(payload);
    await participant.remove();
    const response = await this.findOne(request.id);

    const notification: CreateNotificationDto = {
      createdById: customer.id,
      createdForId: request.vendorId,
      recordId: request.id,
      metaData: request,
      type: NotificationTypes.REQUEST_MADE,
    };

    this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

    return response;
  }

  async acceptRequest(id: string, user: User, acceptRequestDto: AcceptRequestDto) {
    const request = await this.findOne(id);

    const { vendor, customerStatus, vendorStatus } = request;

    const { customOffer } = acceptRequestDto;

    if (user.id != vendor.id) throw new UnauthorizedException("Cannot accept request that doesn't belong to you");

    if (customerStatus != RequestStatus.Pending || vendorStatus != RequestStatus.Pending)
      throw new BadRequestException("Cannot accept request that isn't pending");

    const payload: any = {
      vendorStatus: RequestStatus.Accepted,
      customOffer,
    };

    if (!customOffer) {
      payload.customerStatus = RequestStatus.Accepted;
      payload.status = RequestStatus.Accepted;
    }

    await this.update(id, payload);

    const response = await this.findOne(request.id);

    const notification: CreateNotificationDto = {
      createdById: request.vendorId,
      createdForId: request.customerId,
      recordId: request.id,
      metaData: request,
      type: NotificationTypes.REQUEST_ACCEPTED_VENDOR,
    };

    this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

    return response;
  }

  async declineRequest(id: string, user: User) {
    const request = await this.findOne(id);

    const { vendor, customerStatus } = request;

    if (user.id != vendor.id) throw new UnauthorizedException("Cannot decline request that doesn't belong to you");

    if (customerStatus != RequestStatus.Pending) throw new BadRequestException("Cannot decline request that isn't pending");

    await this.update(id, { vendorStatus: RequestStatus.Declined, status: RequestStatus.Declined });

    const response = await this.findOne(request.id);

    const notification: CreateNotificationDto = {
      createdById: user.id,
      createdForId: request.customerId,
      recordId: request.id,
      metaData: request,
      type: NotificationTypes.REQUEST_DECLINED_VENDOR,
    };

    this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

    return response;
  }

  async customerAccept(id: string, user: User) {
    const request = await this.findOne(id);

    const { customer, vendorStatus } = request;

    if (user.id != customer.id) throw new UnauthorizedException("Cannot accept request that doesn't belong to you");

    if (vendorStatus != RequestStatus.Accepted) throw new BadRequestException("Cannot accept request that isn't accepted");

    await this.update(id, {
      customerStatus: RequestStatus.Accepted,
      status: RequestStatus.Accepted,
    });

    const response = await this.findOne(request.id);

    const notification: CreateNotificationDto = {
      createdById: user.id,
      createdForId: request.vendorId,
      recordId: request.id,
      metaData: request,
      type: NotificationTypes.REQUEST_ACCEPTED_CUSTOMER,
    };

    this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

    return response;
  }

  async customerDecline(id: string, user: User) {
    const request = await this.findOne(id);

    const { customer, vendorStatus } = request;

    if (user.id != customer.id) throw new UnauthorizedException("Cannot decline request that doesn't belong to you");

    if (vendorStatus != RequestStatus.Accepted) throw new BadRequestException("Cannot decline request that isn't accepted");

    console.log(request);

    await super.update(id, {
      customerStatus: RequestStatus.Declined,
      status: RequestStatus.Declined,
    });
    const response = await this.findOne(request.id);

    const notification: CreateNotificationDto = {
      createdById: user.id,
      createdForId: request.vendorId,
      recordId: request.id,
      metaData: request,
      type: NotificationTypes.REQUEST_ACCEPTED_CUSTOMER,
    };

    this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

    return response;
  }

  async customerAcceptFromChat(messageId: string, user: User) {
    const message = await getRepository(Message).findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.metadata?.status == RequestStatus.Declined) throw new BadRequestException('Cannot accept a declined offer');
    const conversation = await this.conversationsService.findOne(message.conversationId, user);
    if (message.userId == user.id) throw new BadRequestException('Cannot accept your own custom offer');

    const requestDto = this.requestRepo.create({
      customOffer: message.metadata,
      customerId: user.id,
      vendorId: conversation.product.userId,
      productId: conversation.productId,
      customerStatus: RequestStatus.Accepted,
      vendorStatus: RequestStatus.Accepted,
      status: RequestStatus.Accepted,
      quantity: 0,
    });
    const request = await this.requestRepo.save(requestDto);

    // await getRepository(Message).update(messageId, { requestId: request.id, metadata: { ...message.metadata, status: 'Accepted' } });
    message.requestId = request.id;
    message.metadata = { ...message.metadata, status: RequestStatus.Accepted };

    this.eventEmitter.emit('customOffer.interact', conversation.product.userId);
    return message.save();
  }

  async customerDeclineFromChat(messageId: string, user: User) {
    const message = await getRepository(Message).findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    const conversation = await this.conversationsService.findOne(message.conversationId, user);
    if (message.userId == user.id) throw new BadRequestException('Cannot decline your own custom offer');

    message.metadata = { ...message.metadata, status: RequestStatus.Declined };
    this.eventEmitter.emit('customOffer.interact', conversation.product.userId);
    return message.save();
  }

  findOne(id: string) {
    const query = this.requestRepo.createQueryBuilder('root');

    query.where('root.id = :id', { id });

    query.leftJoinAndSelect('root.product', 'product');
    query.leftJoinAndSelect('product.user', 'user');
    query.leftJoinAndSelect('root.customer', 'customer');
    query.leftJoinAndSelect('root.vendor', 'vendor');

    return query.getOne();
  }
}
