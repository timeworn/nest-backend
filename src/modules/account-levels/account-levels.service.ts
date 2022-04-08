import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { CreateAccountLevelDto } from './dto/create-account-level.dto';
import { UpdateAccountLevelDto } from './dto/update-account-level.dto';
import { AccountLevel } from './entities/account-level.entity';

@Injectable()
export class AccountLevelsService extends AbstractService<AccountLevel> {
  constructor(
    @InjectRepository(AccountLevel)
    private readonly accountLevelRepo: Repository<AccountLevel>,
  ) {
    super();
    this.repository = this.accountLevelRepo;
    this.modelName = 'Account level';
  }
}
