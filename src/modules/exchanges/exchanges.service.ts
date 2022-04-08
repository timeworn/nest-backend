import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Exchange } from './entities/exchange.entity';

@Injectable()
export class ExchangesService extends AbstractService<Exchange> {
  constructor(@InjectRepository(Exchange) private readonly exchangesRepo: Repository<Exchange>) {
    super();
    this.repository = this.exchangesRepo;
  }
}
