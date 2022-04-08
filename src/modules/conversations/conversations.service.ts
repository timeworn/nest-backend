import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, getRepository, Repository } from 'typeorm';
import { Message } from '../messages/entities/message.entity';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { User } from '../users/entities/user.entity';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation) private readonly conversationsRepo: Repository<Conversation>,
    private readonly productsService: ProductsService,
  ) {}

  async create(productId: string, authUser: User) {
    const product = await this.productsService.findOne(productId);

    const query = this.conversationsRepo.createQueryBuilder('root');

    query.leftJoinAndSelect('root.product', 'product');

    query.leftJoinAndSelect('product.user', 'user');

    query.leftJoinAndSelect('root.customer', 'customer');

    query.where('root.customerId = :customerId', { customerId: authUser.id });

    query.andWhere('root.productId = :productId', { productId: product.id });

    const conversation = await query.getOne();

    if (conversation) return conversation.toDto(authUser);

    const response = this.conversationsRepo.create({
      customerId: authUser.id,
      productId,
    });

    const data = await this.conversationsRepo.save(response);

    const item = await this.findOne(data.id, authUser);

    return item.toDto(authUser);
  }

  async findAll(authUser: User) {
    const query = this.conversationsRepo.createQueryBuilder('root');

    query.leftJoinAndSelect('root.product', 'product');

    query.leftJoinAndSelect('product.user', 'user');

    query.where('root.customerId = :customerId', { customerId: authUser.id });

    query.orWhere('product.userId = :vendorId', { vendorId: authUser.id });

    query.leftJoinAndSelect('root.customer', 'customer');

    query.orderBy('root.createdAt', 'DESC');

    const data = await query.getMany();

    const conversations = [];

    for (const item of data) {
      const unread = await this.getUnreadMessages(authUser, item.id);

      const payload = {
        id: item.id,
        receiverId: item.customerId,
        receiver: item.customer,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        product: item.product,
        lastMessage: {},
        unread: unread.length,
      };

      if (payload.receiverId == authUser.id) {
        payload.receiver = item.product.user;
        payload.receiverId = item.product.userId;
      }

      payload.lastMessage = await getRepository(Message).findOne({
        where: { conversationId: payload.id },
        order: { createdAt: 'DESC' },
      });

      if (!payload.lastMessage) continue;

      conversations.push(payload);
    }

    return conversations;
  }

  async getUnreadMessages(user: User, id: string) {
    const response = await getRepository(Message)
      .createQueryBuilder('root')
      .where('root.conversationId = :id', { id })
      .andWhere('root.userId <> :userId', { userId: user.id })
      .andWhere('root.read <> true')
      .getMany();
    return response;
  }

  async findOne(id: string, user: User) {
    const query = this.conversationsRepo.createQueryBuilder('root');

    query.where('root.id = :id', { id: id });

    query.leftJoinAndSelect('root.product', 'product');

    query.andWhere(
      new Brackets((sb) => {
        sb.where('product.userId = :userId', { userId: user.id });
        sb.orWhere('root.customerId = :customerId', { customerId: user.id });
      }),
    );

    query.leftJoinAndSelect('product.user', 'user');
    query.leftJoinAndSelect('root.customer', 'customer');

    const response = await query.getOne();

    if (!response) {
      throw new UnauthorizedException('Conversation does not belong to you');
    }

    return response;
  }
}
