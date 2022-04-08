import { Module } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccount } from './entities/bank-account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BanksModule } from '../banks/banks.module';
import { UtilitiesModule } from '../utilities/utilities.module';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount]), BanksModule, UtilitiesModule],
  controllers: [BankAccountsController],
  providers: [BankAccountsService],
})
export class BankAccountsModule {}
