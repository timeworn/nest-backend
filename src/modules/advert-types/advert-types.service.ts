import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { CreateAdvertTypeDto } from './dto/create-advert-type.dto';
import { UpdateAdvertTypeDto } from './dto/update-advert-type.dto';
import { AdvertType } from './entities/advert-type.entity';

@Injectable()
export class AdvertTypesService extends AbstractService<AdvertType> {
  constructor(
    @InjectRepository(AdvertType)
    private readonly advertTypesRepo: Repository<AdvertType>,
  ) {
    super();
    this.repository = this.advertTypesRepo;
    this.modelName = 'Advert type';
  }
}
