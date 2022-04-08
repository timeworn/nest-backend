import { Point } from 'geojson';
import { AfterLoad, Column, Entity, getRepository, Index, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { AppCurrency } from '../../../shared/enums/app-currency.enum';
import { Logistic } from '../../logistics/entities/logistic.entity';
import { RequestEntity } from '../../requests/entities/request.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order extends AbstractEntity {
  @OneToOne(() => RequestEntity)
  @JoinColumn()
  request: RequestEntity;

  @Column({ unique: true })
  orderNumber: string;

  @Column({ nullable: true })
  requestId: string;

  @Column('float')
  totalAmount: number;

  @Column('float')
  subTotal: number;

  @Column('float')
  deliveryFee: number;

  @Column('jsonb', { default: {} })
  charges: Record<string, any>;

  @Column()
  quantity: number;

  @Column({ default: AppCurrency.NAIRA })
  currency: string;

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

  @ManyToOne(() => Logistic)
  @JoinColumn()
  logistic: Logistic;

  @Column({ nullable: true })
  logisticsId: string;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  pickupLocation: Point;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  deliveryLocation: Point;

  @Column()
  status: string;

  @Column({ default: 'Processing' })
  customerStatus: string;

  @ManyToOne(() => Transaction)
  @JoinColumn()
  transaction: Transaction;

  @Column({ nullable: true })
  transactionId: string;

  @ManyToOne(() => Transaction)
  @JoinColumn()
  customerTransaction: Transaction;

  @Column({ nullable: true })
  customerTransactionId: string;

  @Column('jsonb', { default: [] })
  statusTimeline: string[];

  public hasReviewed: boolean = false;
  public review: Review;

  @AfterLoad()
  async handleAfterLoad() {
    // const review = await getRepository(Review).findOne({where: {}})
  }

  async toDto(user: User) {
    const review = await getRepository(Review).findOne({ where: { userId: user.id, orderId: this.id } });
    this.review = review;
    if (review) this.hasReviewed = true;
    else this.hasReviewed = false;

    return this;
  }
}
