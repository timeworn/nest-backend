import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

import * as dotenv from 'dotenv';
import { AppConstants } from '../../constants';
import { UsersModule } from '../users/users.module';
import { RolesModule } from '../roles/roles.module';
import { WalletTypesModule } from '../wallet-types/wallet-types.module';
import { Thresh0ldAddressService } from '../../integrations/thresh0ld/thresh0ld-address.service';
import { Thresh0ldModule } from '../../integrations/thresh0ld/thresh0ld.module';
import { ReferralsModule } from '../referrals/referrals.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: AppConstants.JWT_SECRET,
      signOptions: {
        expiresIn: '1 year',
      },
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    UsersModule,
    RolesModule,
    WalletTypesModule,
    Thresh0ldModule,
    ReferralsModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [PassportModule, JwtStrategy, JwtModule],
})
export class AuthModule {}
