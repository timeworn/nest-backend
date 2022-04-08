import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), ProductsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [TypeOrmModule, ConversationsService, ProductsModule],
})
export class ConversationsModule {}
