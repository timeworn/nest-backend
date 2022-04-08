import { ApiProperty } from '@nestjs/swagger';
import { Point } from 'geojson';
import { AfterLoad, BeforeInsert, getRepository, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { Helper } from '../../../shared/helpers';
import { Category } from '../../categories/entities/category.entity';
import { Interest } from '../../interests/entities/interest.entity';
import { SmartSearch } from '../../smart-search/entities/smart-search.entity';
import { User } from '../../users/entities/user.entity';
import * as faker from 'faker';
import { Review } from '../../reviews/entities/review.entity';

@Entity('products')
export class Product extends BasicEntity {
  @Column('simple-array')
  images: string[];

  // @Column('simple-array')
  // tags: string[];

  @Column('float')
  amount: number;

  @Column({ default: 'NGN' })
  currency: string;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @Column({ default: false })
  published: boolean;

  @Column('text')
  address: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToMany(() => Category, (categories) => categories.products, {
    eager: true,
  })
  @JoinTable()
  categories: Category[];

  @ManyToMany(() => Interest, (tags) => tags.products, {
    eager: true,
  })
  @JoinTable()
  tags: Interest[];

  @OneToMany(() => Review, (reviews) => reviews.product)
  reviews: Review[];

  // @ManyToMany(() => SmartSearch, (smartSearch) => smartSearch.products)
  // @JoinTable()
  // smartSearch: SmartSearch[];

  public lng: number;

  public lat: number;

  public rating: string = '0';

  @BeforeInsert()
  beforeInsert() {
    this.slug = Helper.slugify(this.name + ' ' + faker.random.alphaNumeric(6) + faker.random.number(99));
  }

  @AfterLoad()
  async handleAfterLoad() {
    this.lng = this.location.coordinates[0];
    this.lat = this.location.coordinates[1];
  }
}
