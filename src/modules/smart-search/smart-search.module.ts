import { Module } from '@nestjs/common';
import { SmartSearchService } from './smart-search.service';
import { SmartSearchController } from './smart-search.controller';
import { SmartSearch } from './entities/smart-search.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([SmartSearch]), ProductsModule],
  controllers: [SmartSearchController],
  providers: [SmartSearchService],
})
export class SmartSearchModule {}
