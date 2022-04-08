import { Module } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { InterestsController } from './interests.controller';
import { Interest } from './entities/interest.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Interest])],
  controllers: [InterestsController],
  providers: [InterestsService],
})
export class InterestsModule {}
