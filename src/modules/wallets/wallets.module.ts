import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { Wallet } from './entities/wallet.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thresh0ldService } from '../../integrations/thresh0ld/thresh0ld.service';
import { UtilitiesModule } from '../utilities/utilities.module';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  controllers: [WalletsController],
  providers: [WalletsService, Thresh0ldService],
})
export class WalletsModule {}
