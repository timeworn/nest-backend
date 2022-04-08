import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Conversation } from '../../conversations/entities/conversation.entity';
import { Product } from '../../products/entities/product.entity';
import { RequestEntity } from '../../requests/entities/request.entity';
import { User } from '../../users/entities/user.entity';
import { MessageType } from '../enums/message.enum';

@Entity('messages')
export class Message extends AbstractEntity {
  // @ManyToOne(() => Product)
  // @JoinColumn()
  // product: Product;

  // @Column({ nullable: false })
  // productId: string;

  @ManyToOne(() => Conversation)
  @JoinColumn()
  conversation: Conversation;

  @Column({ nullable: false })
  conversationId: string;

  @Column('enum', { enum: MessageType, default: MessageType.Text })
  type: string;

  @Column('text')
  body: string;

  @Column('jsonb')
  metadata: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: false })
  userId: string;

  @Column({ default: false })
  read: boolean;

  @ManyToOne(() => RequestEntity)
  @JoinColumn()
  request: RequestEntity;

  @Column({ nullable: true })
  requestId: String;
}
