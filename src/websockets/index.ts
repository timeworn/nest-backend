import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { AppConstants } from '../constants';
import { OnEvent } from '@nestjs/event-emitter';
import { SearchRequestType } from '../modules/smart-search/enums/search-request.enum';
import { SmartSearch } from '../modules/smart-search/entities/smart-search.entity';
import { Product } from '../modules/products/entities/product.entity';
import { AppEvents } from '../constants/events';
import { NotificationEntity } from '../notifications/entities/notification.entity';
import { NotificationTypes } from '../notifications/enum/notification-types.enum';
import { Order } from '../modules/orders/entities/order.entity';
import { User } from '../modules/users/entities/user.entity';
import { FirebaseMessagingService } from '@aginix/nestjs-firebase-admin';
import { getRepository } from 'typeorm';

@WebSocketGateway({
  // namespace: '/',

  cors: {
    // origin: 'http://127.0.0.1:5500',
    // methods: ['GET', 'POST'],
  },
})
export class ListenerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private firebaseMessageService: FirebaseMessagingService) {} // private readonly searchRequestsService: SearchRequestsService, // private readonly productsService: ProductsService

  @WebSocketServer()
  server: Server;

  connectedUsers: string[] = [];

  @OnEvent('customOffer.interact')
  handleCustomOfferResponse(vendorId: any) {
    this.server.to(vendorId).emit('new-message', {});
  }

  @OnEvent('wallet.refresh')
  handleWalletRefresh(userId: any) {
    this.server.to(userId).emit('refresh-wallet', {});
  }

  @OnEvent(AppEvents.REFRESH_ORDER)
  handleRefreshOrder({ order, user }: { order: Order; user: User }) {
    if (user.id == order.vendorId) this.server.to(order.customerId).emit('refresh-order', order.id);
    if (user.id == order.customerId) this.server.to(order.vendorId).emit('refresh-order', order.id);
  }

  @OnEvent('message.create')
  handleNewMessage(payload: any) {
    const { receiver } = payload;
    console.log(`sending message to ${receiver.id} from ${payload.userId}`);
    this.server.to(receiver.id).emit('new-message', payload);
  }

  @OnEvent('smartSearch.create')
  async handleSearchRequestCreated(createSearchRequestResponse: any) {
    console.log(`${createSearchRequestResponse.products.length} products found`);
    const { smartSearch } = createSearchRequestResponse;

    const products: Product[] = createSearchRequestResponse.products;

    const { productName, type } = smartSearch;

    const treatedVendors = [];

    for (const product of products) {
      const { user } = product;

      console.log('preparing emit to product user', user.id);

      if (this.connectedUsers.indexOf(user.id) == -1) continue;

      if (treatedVendors.indexOf(user.id) != -1) continue;

      console.log('emitting to product user', user.id);

      const availableProducts = products.filter((x) => x.userId == user.id);

      const event = type == SearchRequestType.BULK_ORDER ? 'bulk-product-request' : 'user-product-request';
      this.server.to(user.id).emit(event, {
        smartSearchId: smartSearch.id,
        message: `Someone is searching for ${productName} on Spottr.\nIs this product available?`,
        productName,
        lng: product.location.coordinates[0],
        lat: product.location.coordinates[1],
        availableProducts,
      });

      treatedVendors.push(user.id);
    }
  }

  @OnEvent('smartSearch.join')
  async handleJoinSearchRequest(payload: any) {
    const { smartSearch, user } = payload;
    const { createdById } = smartSearch;
    console.log('sending join event to smartSearch user', createdById);
    this.server.to(createdById).emit('smart-search', {
      ...smartSearch,
      message: `${user.firstName} joined your search for ${smartSearch.productName}`,
    });
  }

  @OnEvent(AppEvents.SEND_NOTIFICATION)
  handleNotification(notification: NotificationEntity) {
    const { createdForId } = notification;

    // console.log('NEW NOTIFICATION', notification);

    this.sendNotification(createdForId, notification, 'notification');

    // switch (notification.type) {
    //   case NotificationTypes.REQUEST_MADE:
    //     this.sendNotification(createdForId, notification, 'notification');
    //     break;
    //   // case NotificationTypes.REQUEST_ACCEPTED:
    //   //   this.sendNotification(createdForId, notification, 'notification');
    //   //   break;
    //   // case NotificationTypes.REQUEST_DECLINED:
    //   //   this.sendNotification(createdForId, notification, 'notification');
    //   //   break;
    //   //   case NotificationTypes:
    //   //     this.sendNotification(createdForId, notification, 'notification');
    //   //     break;
    //   default:
    //     break;
    // }
  }

  async handleConnection(socket: Socket) {
    try {
      const response = await this.validate(socket);
      const { id } = response;
      socket.join(id);
      this.connectedUsers = [...this.connectedUsers, id];
      const onlineUsers = [...new Set(this.connectedUsers)];
      this.connectedUsers = onlineUsers;
      console.log('connected users', this.connectedUsers);
      this.server.emit('online-users', this.connectedUsers);
    } catch (error) {
      console.log('connection error', error);
    }
  }

  async handleDisconnect(socket) {
    try {
      const response = await this.validate(socket);
      const { id } = response;
      socket.leave(id);
      const userExist = this.connectedUsers.indexOf(id);

      if (userExist > -1) {
        this.connectedUsers = [...this.connectedUsers.slice(0, userExist), ...this.connectedUsers.slice(userExist + 1)];
      }
      const onlineUsers = [...new Set(this.connectedUsers)];
      this.connectedUsers = onlineUsers;

      console.log('connected users', this.connectedUsers);
      this.server.emit('online-users', this.connectedUsers);
    } catch (error) {}
  }

  async validate(socket: Socket): Promise<Record<string, any>> {
    const token: any = socket.handshake.query.token;
    console.log('connection request from user with token', token);
    if (!token) throw new WsException('Unauthorized');
    const tokendata: any = await verify(token, AppConstants.JWT_SECRET);
    return tokendata;
  }

  async sendNotification(userId: string, notification: NotificationEntity, eventId: string) {
    const user = await getRepository(User).findOne({ where: { id: userId } });

    if (user.setting.pushNotifications == false) return;

    if (this.connectedUsers.indexOf(user.id) != -1) {
      console.log(`sending to ${user.username} using socket `);
      this.server.to(userId).emit('notification', notification);
      return;
    }

    console.log(`sending to ${user.username} using ${user.fcmToken} `);

    try {
      await this.firebaseMessageService.sendToDevice([user.fcmToken], {
        data: {
          body: JSON.stringify(notification),
        },
      });
    } catch (error) {
      console.log(`failed to send notification to ${user.username}`);
    }
  }
}
