import { AfterLoad, Column, Entity, getRepository, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../enums/request-status.enum';
import { CustomOffer } from '../models/custom-offer.model';

@Entity('requests')
export class RequestEntity extends AbstractEntity {
  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  @Column('float')
  quantity: number;

  @ManyToOne(() => User)
  @JoinColumn()
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => User)
  @JoinColumn()
  vendor: User;

  @Column()
  vendorId: string;

  @Column('enum', { enum: RequestStatus, default: RequestStatus.Pending })
  vendorStatus: string;

  @Column('enum', { enum: RequestStatus, default: RequestStatus.Pending })
  customerStatus: string;

  @Column('enum', { enum: RequestStatus, default: RequestStatus.Pending })
  status: string;

  @Column('jsonb', { default: null, nullable: true })
  // customOffer: Record<string, any>;
  customOffer: CustomOffer;

  @OneToOne(() => Order)
  // @JoinColumn()
  order: Order;

  // @Column({ nullable: true })
  // orderId: string;

  @Column({ default: false })
  completed: boolean;

  public hasCustomOffer: boolean;
  public actualAmount: number;
  // public isCustomer: boolean;

  @AfterLoad()
  async handleAfterLoad() {
    this.hasCustomOffer = this.customOffer != null;

    // this.product = await getRepository(Product).findOne({ id: this.productId });

    this.actualAmount = this.hasCustomOffer ? this.customOffer.amount : this.product.amount * this.quantity;

    // this.customer = await getRepository(User).findOne({
    //   where: { id: this.customerId },
    //   relations: [],
    // });

    // this.vendor = await getRepository(User).findOne({
    //   where: { id: this.vendorId },
    //   relations: [],
    // });
  }
}
