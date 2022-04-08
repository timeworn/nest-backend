import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { Repository } from 'typeorm';
import { ConversationsService } from '../conversations/conversations.service';
import { Conversation } from '../conversations/entities/conversation.entity';
import { RequestStatus } from '../requests/enums/request-status.enum';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly messagesRepo: Repository<Message>,
    private readonly conversationsService: ConversationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createMessageDto: CreateMessageDto, user: User) {
    const { conversationId, type } = createMessageDto;

    const conversation = await this.conversationsService.findOne(conversationId, user);

    if (type == 'custom_offer') {
      createMessageDto.metadata.status = RequestStatus.Pending;
    }

    const message = await this.messagesRepo.save({
      ...createMessageDto,
      userId: user.id,
    });

    conversation.updatedAt = moment().toDate();
    await conversation.save();

    const receiver = this.getReceiver(user, conversation);

    const response = { ...message, receiver };

    await this.markAsRead(conversationId, user);

    this.eventEmitter.emit('message.create', response);

    return response;
  }

  async findAll(conversationId: string, user: User) {
    await this.conversationsService.findOne(conversationId, user);

    // const response = await this.messagesRepo.find({
    //   where: { conversationId },
    //   order: { createdAt: 'DESC' },
    // });

    const query = this.messagesRepo.createQueryBuilder('root');

    query.where('root.conversationId = :conversationId', { conversationId });

    query.orderBy('root.createdAt', 'DESC');

    query.leftJoinAndSelect('root.user', 'user');

    const response = await query.getMany();

    await this.markAsRead(conversationId, user);

    return response;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }

  public getReceiver(authUser: User, conversation: Conversation) {
    const {
      customerId,
      customer,
      product: { user },
    } = conversation;
    return authUser.id == customerId ? user : customer;
  }

  public async markAsRead(conversationId: string, user: User) {
    await this.conversationsService.findOne(conversationId, user);

    await this.messagesRepo
      .createQueryBuilder()
      .update(Message)
      .set({ read: true })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('userId != :id', { id: user.id })
      .execute();
  }
}
