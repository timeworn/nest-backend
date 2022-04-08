import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(@InjectRepository(Review) private readonly reviewRepo: Repository<Review>, private readonly productsService: ProductsService) {}

  async create(createReviewDto: CreateReviewDto) {
    // const { productId } = createReviewDto;
    // await this.productsService.findOne(productId);
    // return this.reviewRepo.save(createReviewDto);
  }

  findAll(productId: string) {
    return this.reviewRepo.find({ productId });
  }

  list(productId: string) {
    return this.reviewRepo.find({ productId });
  }

  findOne(id: string) {
    return `This action returns a #${id} review`;
  }

  update(id: string, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: string) {
    return `This action removes a #${id} review`;
  }
}
