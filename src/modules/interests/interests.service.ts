import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Interest } from './entities/interest.entity';

@Injectable()
export class InterestsService extends AbstractService<Interest> {
  constructor(
    @InjectRepository(Interest)
    private readonly interestsRepo: Repository<Interest>,
  ) {
    super();
    this.repository = this.interestsRepo;
    this.modelName = 'Interest';
  }
}
