import { Module } from '@nestjs/common';
import { CorporateAccountService } from './corporate-account.service';
import { CorporateAccountController } from './corporate-account.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { RequestMembershipService } from '../request-membership/request-membership.service';
import { CorporateAccountMember } from './entities/corporate-account-member.entity';
import { RequestMembershipModule } from '../request-membership/request-membership.module';

@Module({
  imports: [TypeOrmModule.forFeature([CorporateAccountMember]), UsersModule, RequestMembershipModule],
  controllers: [CorporateAccountController],
  providers: [CorporateAccountService],
  exports: [TypeOrmModule, CorporateAccountService],
})
export class CorporateAccountModule {}
