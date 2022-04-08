import { ApiProperty } from '@nestjs/swagger';
import { Point } from 'geojson';
import {
  AfterLoad,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Helper } from '../../../shared/helpers';
import { Product } from '../../products/entities/product.entity';
import { SearchParticipant } from '../../search-participants/entities/search-participant.entity';
import { User } from '../../users/entities/user.entity';
import { SearchRequestType } from '../enums/search-request.enum';

@Entity('smart-search')
export class SmartSearch extends AbstractEntity {
  @ApiProperty({ example: Helper.faker.commerce.productName() })
  @Column()
  productName: string;

  // @ApiProperty({ example: Helper.faker.address.latitude() })
  // @Column()
  // lat: number;

  // @ApiProperty({ example: Helper.faker.address.longitude() })
  // @Column()
  // lng: number;

  @Index({ spatial: true })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @Column({ enum: SearchRequestType, default: SearchRequestType.SIMPLE })
  type: string;

  @Column({ nullable: true })
  quantity: number;

  // @ApiProperty({ type: [Product] })
  // @ManyToMany(() => Product, (joinedBy) => joinedBy.smartSearch)
  // products: Product[];

  @OneToMany(() => SearchParticipant, (searchParticipants) => searchParticipants.smartSearch, {
    eager: true,
  })
  searchParticipants: SearchParticipant[];

  @ApiProperty({ type: User })
  @ManyToOne(() => User)
  @JoinColumn()
  createdBy: User;

  @Column()
  createdById: string;

  protected lng: number;

  protected lat: number;

  @AfterLoad()
  handleAfterLoad() {
    this.lng = this.location.coordinates[0];
    this.lat = this.location.coordinates[1];
  }
}
