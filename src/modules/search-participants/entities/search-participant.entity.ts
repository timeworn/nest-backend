import { AfterLoad, Column, Entity, getRepository, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../shared/entities/abstract-entity';
import { Product } from '../../products/entities/product.entity';
import { CustomOffer } from '../../requests/models/custom-offer.model';
import { SmartSearch } from '../../smart-search/entities/smart-search.entity';

@Entity('search-participants')
export class SearchParticipant extends AbstractEntity {
  @ManyToOne(() => SmartSearch)
  @JoinColumn()
  smartSearch: SmartSearch;

  @Column()
  smartSearchId: string;

  @ManyToOne(() => Product)
  @JoinColumn()
  product: Product;

  @Column()
  productId: string;

  @Column('jsonb', { default: null })
  customOffer: CustomOffer;

  public hasCustomOffer: boolean;

  @AfterLoad()
  async handleAfterLoad() {
    this.hasCustomOffer = this.customOffer != null;
    this.product = await getRepository(Product).findOne({ id: this.productId });
  }
}
