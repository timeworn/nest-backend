import { Module } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RequestEntity } from './entities/request.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity]), ProductsModule, ConversationsModule],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [TypeOrmModule, RequestsService],
})
export class RequestsModule {}
