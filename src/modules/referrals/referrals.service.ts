import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getRepository, QueryRunner, Repository } from 'typeorm';
import { Helper } from '../../shared/helpers';
import { Order } from '../orders/entities/order.entity';

import { ReferralTask } from '../referral-tasks/entities/referral-task.entity';
import { ReferralTaskCapType } from '../referral-tasks/enums/referral-task-cap-type.enum';
import { ReferralTaskStatus } from '../referral-tasks/enums/referral-task-status.enum';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionTypes, TransactionStatus, TransactionOperations } from '../transactions/enums/transactions.enum';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { CreateReferralDto } from './dto/create-referral.dto';
import { UpdateReferralDto } from './dto/update-referral.dto';
import { Referral } from './entities/referral.entity';

@Injectable()
export class ReferralsService {
  constructor(@InjectRepository(Referral) private readonly referralRepo: Repository<Referral>) {}

  async create(queryRunner: QueryRunner, createReferralDto: CreateReferralDto, user: User) {
    const { referralCode, fiatWallet } = createReferralDto;
    const { country } = user;

    // const queryRunner = getConnection().createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    const referredBy = await getRepository(User).findOne({ where: { referralCode } });

    if (!referredBy) throw new NotFoundException('Referral code not valid');

    if (referredBy.country != country) throw new BadRequestException(`Referral program not available in ${country}`);

    const referralTask = await getRepository(ReferralTask).findOne({
      where: {
        country,
        status: ReferralTaskStatus.Active,
      },
      order: { createdAt: 'DESC' },
    });

    if (!referralTask) throw new NotFoundException('No active referral programs exist');

    const referrals = await this.referralRepo.find({
      where: {
        referralTaskId: referralTask.id,
      },
    });

    const { capType, cap, refferedByPercentage, amount } = referralTask;

    if (capType == ReferralTaskCapType.PERSON) {
      if (referrals.length > cap) throw new BadRequestException('Referral cap reached');
    }

    const referralDto: Partial<Referral> = {
      amount: (refferedByPercentage / 100) * amount,
      referralTaskId: referralTask.id,
      referredById: referredBy.id,
      referredId: user.id,
      transactions: [],
      hasWithdrawn: false,
    };

    let referral = queryRunner.manager.create(Referral, referralDto);
    referral = await queryRunner.manager.save(referral);

    const { currency } = referralTask;

    // const userWallet = await getRepository(Wallet).findOne({ where: { userId: user.id, walletType: { currency } } });

    // const query = getRepository(Wallet).createQueryBuilder('root');

    // query.leftJoinAndSelect('root.walletType', 'walletType');
    // query.leftJoinAndSelect('root.user', 'user');

    // query.where('walletType.currency = :currency', { currency });

    // query.andWhere('root.userId = :userId', { userId: user.id });

    // const userWallet = await query.getOne();

    // if(!user)

    let transaction = queryRunner.manager.create(Transaction, {
      amount: (1 - refferedByPercentage / 100) * amount,
      currency,
      metadata: {
        recipient: referredBy.fullName,
        currentBalance: 0 + (1 - refferedByPercentage / 100) * amount,
        previousBalance: 0,
        transactionFee: 0,
        transactionMethod: 'Referral bonus',
        username: referredBy.username,
      },
      method: 'wallet',
      type: TransactionTypes.WALLET_TRANSACTION,
      reference: Helper.faker.datatype.uuid(),
      walletId: fiatWallet.id,
      status: TransactionStatus.SUCCESSFUL,
      operation: TransactionOperations.CREDIT,
      serverMetadata: {},
      userId: user.id,
    });

    transaction = await queryRunner.manager.save(transaction);

    await queryRunner.manager.update(Wallet, { id: fiatWallet.id }, { balance: transaction.amount });

    return referral;
  }

  async myReferrals(referralTaskId: string, user: User) {
    return this.referralRepo.find({
      where: { referralTaskId, referredById: user.id },
      relations: ['referred'],
    });
  }

  findAll() {
    return `This action returns all referrals`;
  }

  processReferral = async (order: Order, vendor: User, transaction: Transaction) => {
    let serviceCharge = order.charges.serviceCharge;

    if (order.customerTransaction.method == 'card') serviceCharge = serviceCharge - 150;

    if (serviceCharge > 0) {
      console.log('processing referral commission');
      const referrer = await getRepository(User).findOne({
        where: {
          referralCode: vendor.referredByCode,
        },
      });

      console.log('referrer', referrer.fullName);

      const referralTask = await getRepository(ReferralTask).findOne({
        where: {
          status: ReferralTaskStatus.Active,
          country: vendor.country,
        },
      });

      console.log('refferal task', referralTask.name);

      const referrals = await getRepository(Referral).find({
        where: {
          referralTaskId: referralTask.id,
          referredById: referrer.id,
        },
      });

      const referral = referrals.find((x) => x.referredId == vendor.id);

      const count = referrals.length;

      console.log('refferals', referrals);

      if (referralTask && referralTask.shareholder) {
        console.log('getting level');
        const level = referralTask.levels.find((x) => count >= x.range.min && count <= x.range.max);
        console.log('level', level);
        if (level) {
          const commission = (level.percentage / 100) * order.charges.serviceCharge;
          console.log('commission', commission);
          referral.amount += commission;
          referral.transactions.push(transaction.id);
          await referral.save();
          console.log('commission processed and saved', referral.amount);
        }
      }
    }
  };
}
