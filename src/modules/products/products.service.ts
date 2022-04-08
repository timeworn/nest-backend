import { BadRequestException, Injectable, Param, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { query } from 'express';
import { Point } from 'geojson';
import { getRepository, Repository } from 'typeorm';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Category } from '../categories/entities/category.entity';
import { Interest } from '../interests/entities/interest.entity';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { SavedProduct } from './entities/saved-product.entity';

@Injectable()
export class ProductsService extends AbstractService<Product> {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>, // private readonly savedProductRepo: Repository<SavedProduct>,
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
  ) {
    super();
    this.repository = this.productRepo;
    this.modelName = 'Product';
  }

  async create(createProductDto: CreateProductDto, @CurrentUser() user: User) {
    const { categoryIds, lat, lng, tagIds } = createProductDto;

    const categories = await this.resolveRelationships(categoryIds, Category);
    const tags = await this.resolveRelationships(tagIds, Interest);
    delete createProductDto.categoryIds;
    delete createProductDto.tagIds;

    const location: Point = {
      type: 'Point',
      coordinates: [lng, lat],
    };

    const product = await super.create({
      ...createProductDto,
      userId: user.id,
      location,
      published: true,
    });

    product.categories = categories;
    product.tags = tags;
    return product.save();
  }

  async findAll(pagination: AbstractPaginationDto, filterProductsDto: FilterProductsDto) {
    const { name, lat, lng, userId, categoryId, categoryIds } = filterProductsDto;
    console.log({ filterProductsDto });
    const query = this.productRepo.createQueryBuilder('root');

    const reviews = await getRepository(Review).find();

    if (name) {
      query.andWhere('root.slug LIKE :name', { name: `%${name.toLowerCase()}%` });
    }

    if (lat && lng) {
      let origin: Point = {
        type: 'Point',
        coordinates: [lng, lat],
      };
      if (!categoryId || !categoryIds) {
        query
          .andWhere('ST_DWithin(location, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(location)) ,:range)')
          // .orderBy('distance', 'ASC')
          .setParameters({
            origin: JSON.stringify(origin),
            range: 100000,
          });
      }
    }

    if (userId) {
      query.andWhere('root.userId = :userId', { userId });
    }

    query.leftJoinAndSelect('root.categories', 'categories');

    if (categoryId) {
      const categories = await getRepository(Category).find({ where: { parentId: categoryId } });
      const payload = [categoryId, ...categories.map((x) => x.id)];
      console.log('filter prod payload', payload);
      query.andWhere('categories.id IN (:...categoryId)', { categoryId: payload });
    }

    if (categoryIds) {
      const categories = await getRepository(Category).find({
        where: [
          ...categoryIds.map((x) => {
            return { parentId: x };
          }),
        ],
      });
      const payload = [...categoryIds, ...categories.map((x) => x.id)];
      console.log('filter prod payload', payload);
      query.andWhere('categories.id IN (:...categoryIds)', { categoryIds: payload });
    }

    query.andWhere('root.published = true');

    query.leftJoinAndSelect('root.user', 'user');
    query.leftJoinAndSelect('user.setting', 'setting');
    query.leftJoinAndSelect('root.tags', 'tags');

    const result = await Helper.paginateItems(query, pagination);

    return {
      ...result,
      data: result.data.map((x) => {
        const productReviews = reviews.filter((y) => x.id == y.productId);
        if (productReviews.length > 0) {
          const review = productReviews.map((z) => z.rating);
          x.rating = (review.reduce((a, b) => a + b) / review.length).toFixed(1);
        } else {
          x.rating = 0;
        }

        return x;
      }),
    };
  }

  findAllUser(pagination: AbstractPaginationDto, user: User, type: string) {
    const where = {
      userId: user.id,
    };

    if (type == 'published') {
      where['published'] = true;
    }

    if (type == 'draft') {
      where['published'] = false;
    }

    console.log('my products condition', where);

    return this.productRepo.find({ where });

    // return Helper.paginateItems(this.productRepo, pagination, {
    //   where: where,
    // });
  }

  async bulkPublish(productIds: string[], user: User) {
    // const

    for (const productId of productIds) {
      await this.publish(productId, user);
    }

    return {};
    //  try {

    //  } catch (error) {

    //  }
  }
  async publish(productId: string, user: User) {
    const product = await this.findOne(productId);
    if (product.userId != user.id) throw new UnauthorizedException('Unauthorized');
    product.published = true;
    await product.save();
    return {};
  }

  async bulkUnPublish(productIds: string[], user: User) {
    // const

    for (const productId of productIds) {
      await this.unPublish(productId, user);
    }

    return {};
    //  try {

    //  } catch (error) {

    //  }
  }
  async unPublish(productId: string, user: User) {
    const product = await this.findOne(productId);
    if (product.userId != user.id) throw new UnauthorizedException('Unauthorized');
    product.published = false;
    await product.save();
    return {};
  }

  async save(productId: string, user: User) {
    await this.findOne(productId);
    const isSaved = await getRepository(SavedProduct).findOne({ where: { userId: user.id, productId } });

    if (isSaved) {
      throw new BadRequestException('Product already saved');
    }

    await getRepository(SavedProduct).save({ userId: user.id, productId });

    return {};
  }

  async unsave(productId: string, user: User) {
    await this.findOne(productId);
    const isSaved = await getRepository(SavedProduct).findOne({ where: { userId: user.id, productId } });

    if (!isSaved) {
      throw new BadRequestException(`Can't unsave a product that was not saved`);
    }

    await getRepository(SavedProduct).save({ userId: user.id, productId });

    return {};
  }

  async fetchSaved(user: User) {
    const products = await getRepository(SavedProduct).find({ where: { userId: user.id } });
    return products;
  }

  async reviewProduct(id: string, createReviewDto: CreateReviewDto) {
    await this.findOne(id);
    return this.reviewRepo.save({ ...createReviewDto, productId: id });
  }

  async fetchReviews(id: string) {
    await this.findOne(id);
    return this.reviewRepo.find({ productId: id });
  }
}
