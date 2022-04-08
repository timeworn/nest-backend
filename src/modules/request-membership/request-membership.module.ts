import { CorporateAccountModule } from './../corporate-account/corporate-account.module';
import { RequestMembership } from './entity/request-membership.entity';
import { Module } from '@nestjs/common';
import { RequestMembershipService } from './request-membership.service';
import { RequestMembershipController } from './request-membership.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([RequestMembership])],
  controllers: [RequestMembershipController],
  providers: [RequestMembershipService],
  exports: [TypeOrmModule, RequestMembershipService],
})
export class RequestMembershipModule {}
