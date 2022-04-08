import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { User } from '../users/entities/user.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { GenerateTransactionStatementDto } from './dto/generate-transaction-statement.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { parse } from 'json2csv';
import * as fs from 'fs';
import * as path from 'path';
import { CreateEmailDto } from '../../notifications/emails/dto/create-email.dto';
import { AppMailSenders, AppTemplates } from '../../constants/email';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvents } from '../../constants/events';
import { TransactionStatus } from './enums/transactions.enum';
const Converter = require('csv-converter-to-pdf-and-html');

@Injectable()
export class TransactionsService extends AbstractService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    this.repository = this.transactionRepo;
    this.modelName = 'Transaction';
  }

  findAll(pagination: AbstractPaginationDto, ...args: any) {
    // console.log(...args);
    return Helper.paginateItems(this.repository, pagination, {
      where: args,
      order: { createdAt: 'DESC' },
    });
  }

  async generateStatement(user: User, generateTransactionStatementDto: GenerateTransactionStatementDto) {
    const wallets = await getRepository(Wallet).find({ where: { userId: user.id } });

    const { walletId, startDate, endDate } = generateTransactionStatementDto;

    const where: any = {
      userId: user.id,
    };

    if (walletId) {
      where.walletId = walletId;
    }

    const transactions = await this.transactionRepo.find({
      where,
    });

    const statements = transactions.map((transaction) => {
      const statement = {
        id: transaction.metadata.transactionId,
        type: transaction.type,
        operation: transaction.operation,
        currency: transaction.currency,
        amount: transaction.amount,
        transactionFee: transaction.metadata.transactionFee,
        previousBalance: transaction.metadata.previousBalance,
        currentBalance: transaction.metadata.currentBalance,
        transactionDate: transaction.createdAt,
        from: transaction.metadata.recipient,
        transactionMethod: transaction.metadata.transactionMethod,
        walletType: null,
      };

      if (transaction.walletId) {
        statement.walletType = wallets.find((x) => x.id == transaction.walletId).walletType.name;
      }

      return statement;
    });

    const csv = parse(statements);

    const filename = Helper.faker.datatype.uuid();

    console.log(path.join(__dirname, `/../../database/statements/${filename}.csv`));

    fs.writeFile(path.join(__dirname, `/../../database/statements/${filename}.csv`), csv, async (err) => {
      if (err) {
        console.error(err);
        return;
      }

      // const converter = new Converter();

      // const filePath = path.resolve(path.join(__dirname, `/../../database/statements/${filename}.csv`)); // Caminho completo
      // const destinationPath = path.resolve(path.join(__dirname, `/../../database/statements/${filename}.pdf`));

      // await converter.PDFConverter(filePath, destinationPath);

      // console.log('done');

      const email: CreateEmailDto = {
        subject: 'Transaction Statement',
        template: AppTemplates.TRANSACTIONS_STATEMENT,
        metaData: {},
        receiverEmail: user.email,
        senderEmail: AppMailSenders.INFO,
        attachments: [
          {
            filename: `${filename}.csv`,
            path: path.join(__dirname, `/../../database/statements/${filename}.csv`),
          },
        ],
      };

      this.eventEmitter.emit(AppEvents.SEND_EMAIl, email);
    });

    return {};
  }

  async cancel(id: string, user: User) {
    const transaction = await this.transactionRepo.findOne({ where: { id, userId: user.id } });

    if (!transaction) throw new NotFoundException('Transaction not found');

    if (transaction.status != TransactionStatus.PENDING) throw new BadRequestException("Cannot cancel a transaction that isn't pending");

    transaction.status = TransactionStatus.CANCELLED;

    return transaction.save();
  }
}
