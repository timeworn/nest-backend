import { Module } from '@nestjs/common';
import { WalletTypesService } from './wallet-types.service';
import { WalletTypesController } from './wallet-types.controller';
import { WalletType } from './entities/wallet-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([WalletType])],
  controllers: [WalletTypesController],
  providers: [WalletTypesService],
  exports: [TypeOrmModule, WalletTypesService],
})
export class WalletTypesModule {}
