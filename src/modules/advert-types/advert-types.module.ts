import { Module } from '@nestjs/common';
import { AdvertTypesService } from './advert-types.service';
import { AdvertTypesController } from './advert-types.controller';
import { AdvertType } from './entities/advert-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AdvertType])],
  controllers: [AdvertTypesController],
  providers: [AdvertTypesService],
})
export class AdvertTypesModule {}
