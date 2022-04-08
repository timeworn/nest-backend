import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thresh0ldAddressService } from '../../integrations/thresh0ld/thresh0ld-address.service';
import { AppCurrency } from '../../shared/enums/app-currency.enum';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { User } from '../users/entities/user.entity';
import { DepositAddress } from './entities/deposit-address.entity';

@Injectable()
export class DepositAddressService extends AbstractService<DepositAddress> {
  constructor(
    @InjectRepository(DepositAddress)
    private depositAddressRepo: Repository<DepositAddress>,
    private readonly thresh0ldAddressService: Thresh0ldAddressService,
  ) {
    super();
    this.repository = this.depositAddressRepo;
    this.modelName = 'Deposit Address';
  }

  async list(user: User) {
    const data: DepositAddress[] = await this.repository.find({ where: { userId: user.id } });

    if (data.length > 1) return data;

    const [btcdata, bscdata] = await Promise.all([
      this.thresh0ldAddressService.generateBTCAddress(),
      this.thresh0ldAddressService.generateBSCAddress(),
    ]);

    const ctdata = await this.thresh0ldAddressService.generateBSCAddress();

    await this.depositAddressRepo.insert([
      {
        address: btcdata[0],
        currency: AppCurrency.BITCOIN,
        userId: user.id,
      },
      {
        address: bscdata[0],
        currency: AppCurrency.BSC,
        userId: user.id,
      },

      {
        address: ctdata[0],
        currency: AppCurrency.CLIQ_TOKEN,
        userId: user.id,
      },
    ]);

    return this.repository.find({ where: { userId: user.id } });
  }
}
