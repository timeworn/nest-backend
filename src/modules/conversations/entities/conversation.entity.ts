import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('conversations')
export class Conversation extends AbstractEntity {
  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column({ nullable: false })
  productId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  customer: User;

  @Column({ nullable: false })
  customerId: string;

  toDto(authUser: User) {
    const payload = {
      id: this.id,
      receiverId: this.customerId,
      receiver: this.customer,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      product: this.product,
      lastMessage: {},
      unread: 0,
    };

    if (payload.receiverId == authUser.id) {
      payload.receiver = this.product.user;
      payload.receiverId = this.product.userId;
    }

    return payload;
  }
}
