import { BeforeInsert, Column, Entity, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Helper } from '../../../shared/helpers';
import { Product } from '../../products/entities/product.entity';
import { Setting } from '../../settings/entities/setting.entity';

@Entity('categories')
export class Category extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  slug: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  displayImage: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ default: false }) isSubcategory: boolean;

  @ManyToMany(() => Setting, (setting) => setting.subscribedCategories)
  settings: Setting[];

  @ManyToMany(() => Product, (products) => products.categories)
  products: Product[];

  // protected isSubcategory: boolean;

  // @AfterLoad()
  // handleAfterLoad() {
  //   this.isSubcategory = this.parentId ? true : false;
  // }

  @BeforeInsert()
  make_slug() {
    this.slug = Helper.slugify(this.name);
    this.isSubcategory = this.parentId ? true : false;
  }
}
