import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { BullModule } from '@nestjs/bull';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskConsumer } from './task.consumer';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task]),
    BullModule.registerQueue({
      name: 'task',
    }),
    ProductsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, TaskConsumer],
  exports: [TypeOrmModule, TasksService, BullModule],
})
export class TasksModule {}
