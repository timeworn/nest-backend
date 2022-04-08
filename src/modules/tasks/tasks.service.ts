import { InjectQueue } from '@nestjs/bull';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { getConnection, getRepository, Not, Repository } from 'typeorm';
import { AppEvents } from '../../constants/events';
import { CreateNotificationDto } from '../../notifications/dto/create-notification.dto';
import { NotificationTypes } from '../../notifications/enum/notification-types.enum';
import { AppCurrency } from '../../shared/enums/app-currency.enum';
import GlobalOperations from '../../shared/global';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { ProductsService } from '../products/products.service';
import { Transaction } from '../transactions/entities/transaction.entity';
import { TransactionOperations, TransactionStatus, TransactionTypes } from '../transactions/enums/transactions.enum';
import { TransactionMetadata } from '../transactions/interfaces/transaction-meta';
import { User } from '../users/entities/user.entity';
import { WalletTypes } from '../wallet-types/enums/wallet-types.enum';
import { Wallet } from '../wallets/entities/wallet.entity';
import { CompleteTaskDto } from './dto/complete-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-task.dto';
import { TaskFeedbackDto } from './dto/task-feedback.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskParticipant } from './entities/task-participant.entity';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { TaskTypes } from './enums/task-types.enum';

@Injectable()
export class TasksService extends AbstractService<Task> {
  constructor(
    @InjectRepository(Task) private readonly taskRepo: Repository<Task>,
    @InjectQueue('task') private taskQueue: Queue,
    private readonly productsService: ProductsService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    this.repository = this.taskRepo;
    this.modelName = 'Task';
  }

  async myTasks(user: User) {
    return this.taskRepo.find({
      where: { createdById: user.id },
    });
  }

  async list(args: FilterTasksDto, user: User): Promise<any> {
    return this.taskRepo.find({
      where: { ...args, createdById: Not(user.id) },
    });
  }

  async create(createTaskDto: CreateTaskDto, user: User) {
    const { rewardFee, productId, transactionPin, type } = createTaskDto;

    console.log({ createTaskDto });

    createTaskDto.createdById = user.id;

    await this.productsService.findOne(productId);

    await GlobalOperations.verifyTransactionPin({ transactionPin }, user);

    let task: Task;

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const metadata: Partial<TransactionMetadata> = {
      recipient: createTaskDto.title,
      transactionFee: 0.1 * rewardFee,
      username: '',
    };

    if (type == TaskTypes.BASIC) {
      createTaskDto.maxParticipants = 3;
    }

    try {
      const { transaction } = await GlobalOperations.chargeWallet(queryRunner, {
        amount: 0.1 * rewardFee + rewardFee,
        metadata,
        userId: user.id,
        currency: AppCurrency.CLIQ_TOKEN,
        walletType: WalletTypes.CLIQ_TOKEN,
      });

      task = queryRunner.manager.create(Task, {
        ...createTaskDto,
        rewardFee: transaction.amount,
        transactionId: transaction.id,
      });

      task = await queryRunner.manager.save(task);

      await queryRunner.manager.update(
        Transaction,
        { id: transaction.id },
        {
          metadata: {
            ...transaction.metadata,
            username: task.id,
          },
        },
      );

      await queryRunner.commitTransaction();

      const delayTime = Helper.dayjs(task.createdAt)
        .add(5, 'minute')
        // .add(task.duration, 'day')
        .diff(Helper.dayjs());
      this.taskQueue.add(task, {
        attempts: 5,
        delay: delayTime,
        removeOnComplete: true,
        removeOnFail: false,
      });

      return this.findOne(task.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async join(id: string, user: User, transactionPin: string) {
    const task = await this.findOne(id);

    if (task.hasExpired) throw new BadRequestException('Task has expired');

    if (task.createdById == user.id) {
      throw new ConflictException("You can't join your own task");
    }

    const { rewardFee } = task;

    const isParticipant = task.participants.find((x) => x.userId == user.id);

    if (isParticipant) {
      throw new ConflictException('You are already a participant of this task');
    }

    if (task.participants.length >= task.maxParticipants) {
      throw new BadRequestException('Maximum participants reached');
    }

    await GlobalOperations.verifyTransactionPin({ transactionPin }, user);

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const committedCoin = 0.05 * rewardFee;

    const metadata: Partial<TransactionMetadata> = {
      recipient: `${task.title} task`,
      transactionFee: 0,
      username: task.id,
    };

    try {
      await GlobalOperations.chargeWallet(queryRunner, {
        userId: user.id,
        amount: committedCoin,
        metadata,
        walletType: WalletTypes.CLIQ_TOKEN,
        currency: AppCurrency.CLIQ_TOKEN,
      });

      let participant = queryRunner.manager.create(TaskParticipant, {
        taskId: id,
        userId: user.id,
        committedCoin,
      });

      participant = await queryRunner.manager.save(participant);

      task.participants.push(participant);

      await queryRunner.manager.save(task);

      await queryRunner.commitTransaction();

      return task;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async feedback(id: string, user: User, taskFeedbackDto: TaskFeedbackDto) {
    const { comment, image } = taskFeedbackDto;

    if (!comment && !image) {
      throw new BadRequestException('Provide image or comment feeback or both');
    }
    const task = await this.findOne(id);

    if (task.hasExpired) throw new BadRequestException('Task has expired');

    const participant = task.participants.find((x) => x.userId == user.id);

    if (!participant) {
      throw new BadRequestException('You are not a participant of this task, Join to give feedback');
    }

    participant.response = {
      image,
      comment,
    };

    await participant.save();

    return this.findOne(task.id);
  }

  async complete(id: string, completeTaskDto: CompleteTaskDto, isManual: boolean = false) {
    const task = await this.findOne(id);
    const taskOwner = await getRepository(User).findOne({ where: { id: task.createdById } });

    if (isManual && task.type != TaskTypes.BASIC) throw new BadRequestException('Cannot complete an automatic task');

    if (task.status == TaskStatus.COMPLETED) throw new BadRequestException('Task completed already');

    if (!task.hasExpired) throw new BadRequestException("Cannot complete a task that hasn't reached expiration");

    const { type } = task;
    const reward = task.rewardFee / task.maxParticipants;
    let winners = [];
    let losers = [];
    let participants = [];

    console.log(task);

    if (type == TaskTypes.VALIDATE && task.participants.length > 0) {
      const responses = await TaskParticipant.find({
        where: {
          taskId: task.id,
        },
        order: { createdAt: 'DESC' },
      });

      const response = this.processWinners(responses.filter((x) => x.response));

      winners = responses
        .filter((x) => x.response && x.response.comment == response.answer)
        .map((x) => {
          return {
            ...x,
            status: 'winner',
          };
        });

      losers = responses
        .filter((x) => x.response && x.response.comment == response.other)
        .map((x) => {
          return {
            ...x,
            statys: 'loser',
          };
        });

      const idle = responses
        .filter((x) => !x.response)
        .map((x) => {
          return {
            ...x,
            statys: 'idle',
          };
        });

      task.acceptedAnswer = response.answer;

      await task.save();

      participants = [...winners, ...losers, ...idle];
    }

    if (type == TaskTypes.BASIC && task.participants.length > 0) {
      const responses = await TaskParticipant.find({
        where: {
          taskId: task.id,
        },
        order: { createdAt: 'DESC' },
      });

      const { winnersId } = completeTaskDto;
      if (winnersId.length <= 0) throw new BadRequestException('Select atleast one winner');

      winners = [];

      for (const winnerId of winnersId) {
        const participant = responses.find((x) => x.id == winnerId);
        // const participant = await TaskParticipant.findOne({ where: { id: x, taskId: task.id } });
        if (!participant) throw new NotFoundException('Participant not found');
        winners.push({ ...participant, status: 'winner' });
      }

      losers = responses
        .filter((x) => !winnersId.includes(x.id))
        .map((x) => {
          return {
            ...x,
            status: 'loser',
          };
        });

      participants = [...winners, ...losers];
    }

    for (const participant of participants) {
      if (participant.paid) continue;
      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const wallets = await getRepository(Wallet).find({ where: { userId: participant.userId } });
        const wallet = wallets.find((wallet) => wallet.walletType.slug == WalletTypes.CLIQ_TOKEN);

        let creditAmount: number = 0;
        let transactionFee: number = 0;

        if (participant.status == 'winner') {
          creditAmount = reward + participant.committedCoin;
          transactionFee = 0;
        } else {
          creditAmount = (1 - 0.1) * participant.committedCoin;
          transactionFee = 0.1 * participant.committedCoin;
        }

        let transaction: Partial<Transaction> = {
          amount: creditAmount,
          currency: AppCurrency.CLIQ_TOKEN,
          metadata: {
            currentBalance: wallet.balance + creditAmount,
            previousBalance: wallet.balance,
            recipient: 'Payment for task completed',
            username: taskOwner.username,
            transactionFee,
          },
          operation: TransactionOperations.CREDIT,
          method: 'wallet',
          walletId: wallet.id,
          reference: Helper.faker.datatype.uuid(),
          userId: participant.userId,
          status: TransactionStatus.SUCCESSFUL,
          type: TransactionTypes.WALLET_TRANSACTION,
        };

        await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: wallet.balance + transaction.amount });

        transaction = queryRunner.manager.create(Transaction, transaction);

        transaction = await queryRunner.manager.save(transaction);

        await queryRunner.manager.update(TaskParticipant, { id: participant.id }, { paid: true });

        await queryRunner.commitTransaction();

        const notification: CreateNotificationDto = {
          createdById: task.createdById,
          createdForId: participant.userId,
          recordId: transaction.id,
          metaData: transaction,
          type: NotificationTypes.RECEIVED_MONEY,
        };

        this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);
      } catch (error) {
        console.log('credit error', error);
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(error);
      } finally {
        await queryRunner.release();
      }
    }

    const change = task.rewardFee - reward * winners.length;

    const queryRunner = getConnection().createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallets = await getRepository(Wallet).find({ where: { userId: task.createdById } });
      const wallet = wallets.find((wallet) => wallet.walletType.slug == WalletTypes.CLIQ_TOKEN);
      let transaction: Partial<Transaction> = {
        amount: change,
        currency: AppCurrency.CLIQ_TOKEN,
        metadata: {
          currentBalance: wallet.balance + change,
          previousBalance: wallet.balance,
          recipient: 'Remainder on task reward fee',
          username: taskOwner.username,
          transactionFee: 0,
        },
        operation: TransactionOperations.CREDIT,
        method: 'wallet',
        walletId: wallet.id,
        userId: task.createdById,
        reference: Helper.faker.datatype.uuid(),
        status: TransactionStatus.SUCCESSFUL,
        type: TransactionTypes.WALLET_TRANSACTION,
      };

      await queryRunner.manager.update(Wallet, { id: wallet.id }, { balance: wallet.balance + transaction.amount });

      transaction = queryRunner.manager.create(Transaction, transaction);

      transaction = await queryRunner.manager.save(transaction);

      await queryRunner.manager.update(Task, { id: task.id }, { status: TaskStatus.COMPLETED });

      await queryRunner.commitTransaction();

      const notification: CreateNotificationDto = {
        createdById: task.createdById,
        createdForId: task.createdById,
        recordId: transaction.id,
        metaData: transaction,
        type: NotificationTypes.RECEIVED_MONEY,
      };

      this.eventEmitter.emit(AppEvents.CREATE_NOTIFICATION, notification);

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }

    return {};
  }

  processWinners(participants: TaskParticipant[]) {
    console.log(
      'participants',
      participants.map((x) => x.id),
    );
    if (participants.length <= 0) return { answer: 'duine', other: 'djnedneod' };
    const yes = participants.filter((x) => x.response.comment == 'YES');
    const no = participants.filter((x) => x.response.comment == 'NO');
    if (yes.length > no.length) {
      console.log('answer is YES');
      return { answer: 'YES', other: 'NO' };
    }
    if (no.length > yes.length) {
      console.log('answer is NO');
      return { answer: 'NO', other: 'YES' };
    }
    if (no.length == yes.length) {
      participants.pop();
      return this.processWinners(participants);
    }
  }
}
