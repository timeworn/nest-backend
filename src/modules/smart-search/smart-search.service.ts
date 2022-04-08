import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Point } from 'geojson';
import { getRepository, Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { CustomOffer } from '../requests/models/custom-offer.model';
import { AppRoles } from '../roles/enums/roles.enum';
import { SearchParticipant } from '../search-participants/entities/search-participant.entity';
import { User } from '../users/entities/user.entity';
import { CreateSmartSearchDto } from './dto/create-smart-search.dto';
import { JoinSmartSearchDto } from './dto/join-smart-search.dto';
import { UpdateSmartSearchDto } from './dto/update-smart-search.dto';
import { SmartSearch } from './entities/smart-search.entity';
import { SearchRequestType } from './enums/search-request.enum';

@Injectable()
export class SmartSearchService extends AbstractService<SmartSearch> {
  constructor(
    @InjectRepository(SmartSearch)
    private readonly smartSearchRepo: Repository<SmartSearch>,
    private readonly eventEmitter: EventEmitter2,
    private readonly productsService: ProductsService,
  ) {
    super();
    this.repository = this.smartSearchRepo;
    this.modelName = 'Smart search';
  }

  async create(createSmartSearchDto: CreateSmartSearchDto) {
    const { productName, lat, lng, type, createdById } = createSmartSearchDto;

    const query = getRepository(Product).createQueryBuilder('root');

    query.andWhere('root.slug LIKE :productName', {
      productName: `%${productName.toLowerCase()}%`,
    });

    let origin: Point = {
      type: 'Point',
      coordinates: [lng, lat],
    };

    // query
    //   .andWhere(
    //     'ST_DWithin(root.location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(location)) ,:range)',
    //   )
    //   // .orderBy('distance', 'ASC')
    //   .setParameters({
    //     origin: JSON.stringify(origin),
    //     range: 10000000000,
    //   });

    // query.andWhere(
    //   `ST_DWithin(ST_MakePoint(${lng}, ${lat})::geography,root.location::Geography, 100000)`,
    // );

    // query.leftJoinAndSelect('root.categories', 'categories');
    query.leftJoinAndSelect('root.user', 'user');
    query.leftJoinAndSelect('user.role', 'userRole');
    query.leftJoinAndSelect('root.categories', 'categories');

    query.andWhere('user.id <> :id', { id: createdById });

    if (type == SearchRequestType.BULK_ORDER) {
      query.andWhere(`userRole.slug = corporate_user`);
    }

    if (type == SearchRequestType.SIMPLE) {
      query.andWhere(`userRole.slug = :role`, { role: AppRoles.USER });
    }

    const products = await query.getMany();

    // query.select('column').distinct(true);

    const smartSearch = await super.create({
      ...createSmartSearchDto,
      location: origin,
    });

    this.eventEmitter.emit('smartSearch.create', {
      smartSearch,
      products,
      createdById,
    });

    return smartSearch;
  }

  list(user: User) {
    const query = this.smartSearchRepo.createQueryBuilder('root');
    query.andWhere('root.createdById = :createdById', { createdById: user.id });
    // query.leftJoinAndSelect('root.products', 'products');
    // query.leftJoinAndSelect('products.user', 'user');
    query.leftJoinAndSelect('root.searchParticipants', 'searchParticipants');
    query.leftJoinAndSelect('searchParticipants.product', 'product');
    query.leftJoinAndSelect('product.user', 'user');
    query.leftJoinAndSelect('root.createdBy', 'createdBy');
    query.orderBy('root.createdAt', 'DESC');
    return query.getMany();
    // return this.smartSearchRepo.find({
    //   where: { createdById: user.id },
    //   relations: ['products'],
    // });
  }

  async join(id: string, user: User, joinSmartSearchDto: JoinSmartSearchDto) {
    await this.findOne(id);

    const { productId, customOffer } = joinSmartSearchDto;

    const query = this.smartSearchRepo.createQueryBuilder('root');
    query.where('root.id = :id', { id });
    query.leftJoinAndSelect('root.searchParticipants', 'searchParticipants');
    query.leftJoinAndSelect('searchParticipants.product', 'product');
    query.leftJoinAndSelect('product.user', 'user');
    // query.leftJoinAndSelect('root.products', 'products');
    // query.leftJoinAndSelect('products.user', 'user');
    query.leftJoinAndSelect('root.createdBy', 'createdBy');
    const smartSearch = await query.getOne();

    await this.productsService.findOne(productId);
    // const smartSearch = await this.smartSearchRepo.findOne({
    //   where: { id },
    //   relations: ['products'],
    // });
    if (!smartSearch.searchParticipants) {
      smartSearch.searchParticipants = [];
    }
    // const response = await this.productsService.findAll(
    //   {
    //     page: 1,
    //     limit: 10000,
    //   },
    //   { name: smartSearch.productName, userId: user.id },
    // );

    const searchParticipant = await getRepository(SearchParticipant)
      .create({
        productId,
        customOffer: customOffer,
        smartSearchId: smartSearch.id,
      })
      .save();

    smartSearch.searchParticipants.push(searchParticipant);

    await smartSearch.save();
    const data = await query.getOne();
    this.eventEmitter.emit('smartSearch.join', { smartSearch: data, user });
    return data;
  }
}
