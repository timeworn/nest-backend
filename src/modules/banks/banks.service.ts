import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Bank } from './entities/bank.entity';

@Injectable()
export class BanksService extends AbstractService<Bank> {
  constructor(@InjectRepository(Bank) private readonly bankRepo: Repository<Bank>) {
    super();
    this.repository = this.bankRepo;
    this.modelName = 'Bank';
  }
}
