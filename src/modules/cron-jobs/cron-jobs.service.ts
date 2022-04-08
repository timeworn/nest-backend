import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import axios from 'axios';
import { OnEvent } from '@nestjs/event-emitter';
import { AppConstants } from '../../constants';
import { PaystackService } from '../../integrations/paystack';
import { Bank } from '../banks/entities/bank.entity';
import { Helper } from '../../shared/helpers';
import { TypeOrmUpsert } from '../../shared/plugins/upsert';
import { getRepository } from 'typeorm';
import { LatokenService } from '../../integrations/latoken/latoken.service';
import { TasksService } from '../tasks/tasks.service';
import { Task } from '../tasks/entities/task.entity';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { TaskTypes } from '../tasks/enums/task-types.enum';

@Injectable()
export class CronJobsService {
  constructor(
    private redisCacheService: RedisCacheService,
    private readonly paystackService: PaystackService,

    private readonly latokenService: LatokenService,
    private readonly tasksService: TasksService,
  ) {}

  @Cron('0 * * * *')
  @OnEvent('app.init')
  async handleCurrencyRatesFetch() {
    const response = await axios.get(
      AppConstants.FIXER_URL + 'latest?access_key=' + AppConstants.FIXER_API_KEY + '&base=' + AppConstants.FIXER_BASE_CURRENCY,
    );
    const data = response.data;
    await this.redisCacheService.set('currency_exchange_rates', data);
    // console.log('updating currency rates');
  }

  @Cron('*/1 * * * *')
  async handleCliqTokenPrice() {
    try {
      const response = await this.latokenService.getTickerPair('CT', 'USDT');
      await this.redisCacheService.set('cliq_token_ticker', response);
      // console.log('updating cliq token ticker');
    } catch (e) {
      console.log('error in ct price', e);
    }
  }

  @Cron('*/5 * * * *')
  async handleBanksSync() {
    try {
      console.log('sync started');
      const banks = await getRepository(Bank).find();
      const paystackBanks = await this.paystackService.getBanks();

      const data = paystackBanks.map((x) => {
        const bank: Partial<Bank> = {
          name: x.name,
          code: x.code,
          country: x.country,
          currency: x.currency,
          description: x.name,
          logo: 'https://png.pngtree.com/png-vector/20190227/ourmid/pngtree-vector-bank-icon-png-image_708538.jpg',
          slug: Helper.slugify(x.slug.split('-').join(' ')),
        };

        const existing = banks.find((x) => x.slug == bank.slug);

        if (existing) bank.id = existing.id;

        return bank;
      });

      // await getRepository(Bank).merge(data);
      await TypeOrmUpsert(getRepository(Bank), data, 'banks_constraint', {
        constraintKey: 'banks_constraint',
      });

      console.log('done sync');
    } catch (e) {
      console.log('error in sync', e);
    }
  }

  @Cron('*/1 * * * *')
  async handleExpiredTasks() {
    const tasks = await getRepository(Task).find({
      where: {
        status: TaskStatus.PENDING,
        type: TaskTypes.BASIC,
      },
    });

    // console.log(tasks);

    for (const task of tasks) {
      if (task.hasExpired && task.participants.length <= 0) {
        // console.log('processing task: ' + task.id);
        await this.tasksService.complete(task.id, {});
      }
    }
  }
}
