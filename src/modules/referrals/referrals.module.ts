import { Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Referral } from './entities/referral.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Referral])],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [TypeOrmModule, ReferralsService],
})
export class ReferralsModule {}
