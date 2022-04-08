import { Column, Entity, ManyToMany } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { Product } from '../../products/entities/product.entity';
import { Setting } from '../../settings/entities/setting.entity';

@Entity('interests')
export class Interest extends BasicEntity {
  @Column()
  displayImage: string;

  @ManyToMany(() => Setting, (setting) => setting.interests)
  settings: Setting[];

  @ManyToMany(() => Product, (products) => products.tags, {
    // eager: true,
  })
  products: Product[];
}
