import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { WalletType } from './entities/wallet-type.entity';

@Injectable()
export class WalletTypesService extends AbstractService<WalletType> {
  constructor(
    @InjectRepository(WalletType)
    private readonly walletTypeRepo: Repository<WalletType>,
  ) {
    super();
    this.repository = this.walletTypeRepo;
    this.modelName = 'Wallet Type';
  }
}
