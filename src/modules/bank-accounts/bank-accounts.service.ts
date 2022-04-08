import { BadRequestException, Injectable, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { create } from 'domain';
import { Repository } from 'typeorm';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { BanksService } from '../banks/banks.service';
import { User } from '../users/entities/user.entity';
import { UtilitiesService } from '../utilities/utilities.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccount } from './entities/bank-account.entity';

@Injectable()
export class BankAccountsService extends AbstractService<BankAccount> {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,
    private readonly utilService: UtilitiesService,
    private readonly banksService: BanksService,
  ) {
    super();
    this.repository = this.bankAccountRepo;
    this.modelName = 'Bank Account';
  }

  async create(createBankAccountDto: CreateBankAccountDto, user: User) {
    const { isDefault, accountNumber, bankId } = createBankAccountDto;
    const bank = await this.banksService.findOne(bankId);

    const exist = await this.bankAccountRepo.findOne({ where: { userId: user.id, accountNumber, bankId } });

    if (exist) throw new BadRequestException('Account already added');

    const data = await this.utilService.verifyAccount({
      accountNumber,
      bankCode: bank.code,
    });

    const payload = {
      accountNumber,
      accountName: data.accountName,
      recipientCode: data.recipientCode,
      bankId,
      userId: user.id,
    };

    const bankAccount = await super.create(payload);

    if (isDefault) {
      await this.bankAccountRepo.update({ isDefault, userId: user.id }, { isDefault: false });
      bankAccount.isDefault = true;
      await bankAccount.save();
    }

    return bankAccount;
  }

  findAllByUser(user: User) {
    return this.bankAccountRepo.find({ where: { userId: user.id } });
    // return Helper.paginateItems(this.bankAccountRepo, pagination, {
    //   where: { userId: user.id },
    // });
  }

  async makeDefault(id: string, user: User) {
    await this.findOneByUser(id, user.id);
    await this.bankAccountRepo.update({ isDefault: true, userId: user.id }, { isDefault: false });
    await this.bankAccountRepo.update(id, { isDefault: true });
    return this.findOne(id);
  }

  async remove(id: string, user: User) {
    await this.findOneByUser(id, user.id);
    return super.remove(id);
  }
}
