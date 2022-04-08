import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { SavedProduct } from './entities/saved-product.entity';
import { Review } from '../reviews/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Review])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [TypeOrmModule, ProductsService],
})
export class ProductsModule {}
