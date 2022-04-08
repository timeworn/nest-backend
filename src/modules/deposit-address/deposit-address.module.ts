import { Module } from '@nestjs/common';
import { DepositAddressService } from './deposit-address.service';
import { DepositAddressController } from './deposit-address.controller';
import { DepositAddress } from './entities/deposit-address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Thresh0ldAddressService } from '../../integrations/thresh0ld/thresh0ld-address.service';
import { Thresh0ldModule } from '../../integrations/thresh0ld/thresh0ld.module';

@Module({
  imports: [TypeOrmModule.forFeature([DepositAddress]), Thresh0ldModule],
  controllers: [DepositAddressController],
  providers: [DepositAddressService],
})
export class DepositAddressModule {}
