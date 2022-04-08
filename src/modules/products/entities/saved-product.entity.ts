import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { User } from '../../users/entities/user.entity';
import { Product } from './product.entity';

@Entity('saved-products')
export class SavedProduct extends AbstractEntity {
  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;
}
