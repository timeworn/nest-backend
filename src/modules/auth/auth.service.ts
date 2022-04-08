import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { ChangePasswordDto, GenerateOTPDto, LoginDto, RegisterAccountDto, ResetPasswordDto, VerifyOTPDto } from './auth.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { AccountStatus } from '../users/enums/account-status.enum';
import { UsersService } from '../users/users.service';
import { WalletTypesService } from '../wallet-types/wallet-types.service';
import { WalletType } from '../wallet-types/entities/wallet-type.entity';
import { RolesService } from '../roles/roles.service';
import { Thresh0ldAddressService } from '../../integrations/thresh0ld/thresh0ld-address.service';
import * as generateReferralCode from 'referral-code-generator';
import { DepositAddress } from '../deposit-address/entities/deposit-address.entity';
import { AppCurrency } from '../../shared/enums/app-currency.enum';
import { Wallet } from '../wallets/entities/wallet.entity';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { Helper, log } from '../../shared/helpers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppEvents } from '../../constants/events';
import { CreateEmailDto } from '../../notifications/emails/dto/create-email.dto';
import { AppMailSenders, AppTemplates } from '../../constants/email';
import { Setting } from '../settings/entities/setting.entity';
import { WalletTypes } from '../wallet-types/enums/wallet-types.enum';
import { ReferralsService } from '../referrals/referrals.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly walletTypesService: WalletTypesService,
    private readonly rolesService: RolesService,
    private readonly connection: Connection,
    private readonly thresh0ldAddressService: Thresh0ldAddressService,
    private readonly redisCacheService: RedisCacheService,
    private readonly eventEmitter: EventEmitter2,
    private readonly referralsService: ReferralsService,
  ) {}

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;
    const user = await this.userRepo.findOne({
      where: [{ email: identifier }, { phoneNumber: identifier }],
    });
    if (user && (await user.comparePassword(password))) {
      if (user.status != AccountStatus.ACTIVE) {
        throw new BadRequestException(`Your account is ${user.status}, please contact support`);
      }

      // if (!user.verified) {
      //   throw new BadRequestException(`Please verify your account`);
      // }

      const payload = { id: user.id };
      const token = this.jwtService.sign(payload);
      return { user: user.toJSON(), token };
    }
    throw new UnauthorizedException('Invalid Credentials');
  }

  async register(registerAccountDto: RegisterAccountDto) {
    const { email, phoneNumber, roleId, avatar, referralCode } = registerAccountDto;

    const existingAccount = await this.userRepo.findOne({
      where: [{ email: email }, { phoneNumber: phoneNumber }],
    });

    if (existingAccount) this.processExistingAccount(existingAccount, registerAccountDto);
    const walletTypes: WalletType[] = await this.walletTypesService.list();

    if (walletTypes.length <= 0) throw new BadRequestException('Something went wrong when creating your account');

    const role = await this.rolesService.findOne(roleId);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // const [btcdata, bscdata] = await Promise.all([
      //   // const [btcdata, ethdata, cliqdata] = await Promise.all([
      //   this.thresh0ldAddressService.generateBTCAddress(),
      //   this.thresh0ldAddressService.generateBSCAddress(),
      //   // this.thresh0ldAddressService.generateBSCAddress(),
      //   // this.thresh0ldAddressService.generateCliqTokenAddress(),
      //   // this.thresh0ldAddressService.generateETHAddress(),
      // ]);

      // const ctdata = await this.thresh0ldAddressService.generateBSCAddress();

      // log('generated addresses');

      if (!avatar) {
        registerAccountDto.avatar = 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png';
      }

      let user = queryRunner.manager.create(User, {
        ...registerAccountDto,
        roleId: role.id,
        referralCode: Helper.string(8),
      });
      // user.myReferalCode = generateReferralCode.custom('lowercase', 5, 4, user.id);

      user = await queryRunner.manager.save(user);

      log('stored user in transaction');

      // await queryRunner.manager.insert<DepositAddress>(DepositAddress, [
      //   {
      //     address: btcdata[0],
      //     currency: AppCurrency.BITCOIN,
      //     userId: user.id,
      //   },
      //   {
      //     address: bscdata[0],
      //     currency: AppCurrency.BSC,
      //     userId: user.id,
      //   },

      //   {
      //     address: ctdata[0],
      //     currency: AppCurrency.CLIQ_TOKEN,
      //     userId: user.id,
      //   },
      // ]);

      // log('stored deposit addresses in transaction');

      let walletsdatum: Partial<Wallet>[] = [];

      let fiatWalletId: string;

      for (const walletType of walletTypes) {
        if (walletType.slug == WalletTypes.FIAT_WALLET) fiatWalletId = walletType.id;

        const userWallet = {
          balance: walletType.slug == WalletTypes.FIAT_WALLET ? 10 : 0,
          userId: user.id,
          walletTypeId: walletType.id,
        };
        walletsdatum.push(userWallet);
      }

      const result = await queryRunner.manager.insert(Wallet, walletsdatum);

      const wallets = result.raw;

      const fiatWallet = wallets.find((x) => x.balance == 10);

      await queryRunner.manager.update(Wallet, { balance: 10 }, { balance: 0 });

      log('stored wallets in transaction');

      const settings = queryRunner.manager.create(Setting, {
        userId: user.id,
      });

      await queryRunner.manager.save(settings);

      await queryRunner.manager.update(User, { id: user.id }, { settingId: settings.id });

      log('saved settings information');

      if (referralCode) {
        await this.referralsService.create(
          queryRunner,
          {
            referralCode,
            fiatWallet: fiatWallet as Wallet,
          },
          user,
        );

        await queryRunner.manager.update(User, { id: user.id }, { settingId: settings.id, referredByCode: referralCode });
      }

      await queryRunner.commitTransaction();

      log('committed transaction');

      var otp = Helper.generateToken();

      await this.redisCacheService.set(phoneNumber, otp, { ttl: 300000 });

      user = await this.userRepo.findOne({ id: user.id });

      const email: CreateEmailDto = {
        subject: 'Verify Account',
        template: AppTemplates.VERIFY_ACCOUNT,
        metaData: { code: otp },
        receiverEmail: user.email,
        senderEmail: AppMailSenders.INFO,
      };

      this.eventEmitter.emit(AppEvents.SEND_EMAIl, email);
      // if (user.referralCode) {
      //   // get user with the code
      //   const referredBy = await this.userService.findOne(user.referralCode, 'myReferralCode');
      //   this.eventEmitter.emit(AppEvents.USER_CREATED, {
      //     userId: user.id,
      //     referrerId: referredBy.id,
      //   } as CreateReferalDto);
      // }

      return {
        token: this.jwtService.sign({ id: user.id }),
        user: user.toJSON(),
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  processExistingAccount(existingAccount: User, registerAccountDto: RegisterAccountDto) {
    const { email, phoneNumber, username } = registerAccountDto;

    if (existingAccount.status == AccountStatus.DEACTIVATED) {
      throw new BadRequestException('Kindly contact support to reactivate your account');
    } else if (existingAccount.email == email && existingAccount.phoneNumber == phoneNumber) {
      throw new BadRequestException('Account already exist with this email and phone number');
    } else if (existingAccount.email == email) {
      throw new BadRequestException('Account already exist with this email');
    } else if (existingAccount.phoneNumber == phoneNumber) {
      throw new BadRequestException('Account already exist with this phone number');
    }
    // else if (existingAccount.username == username) {
    //   throw new BadRequestException('Account already exist with this username');
    // }
  }

  async forgotPassword(identifier: string) {
    const user = await this.userRepo.findOne({
      where: [{ email: identifier }, { phoneNumber: identifier }],
    });
    if (!user) throw new NotFoundException('Account does not exist');

    var otp = Helper.generateToken();

    this.eventEmitter.emit(AppEvents.STORE_IN_CACHE, {
      key: identifier,
      value: otp,
    });

    const email: CreateEmailDto = {
      subject: 'Forgot Password',
      template: AppTemplates.FORGOT_PASSWORD,
      metaData: { code: otp },
      receiverEmail: user.email,
      senderEmail: AppMailSenders.INFO,
    };

    this.eventEmitter.emit(AppEvents.SEND_EMAIl, email);

    return {};
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { code, password, email } = resetPasswordDto;
    const user: User = await this.userService.findOne(email, 'email');
    const otp = await this.redisCacheService.get(email);
    console.log(otp, code);
    if (otp.data != code) {
      throw new UnauthorizedException('Invalid reset token');
    }
    user.password = password;
    // user.code = null;
    await user.handleBeforeInsert();
    await user.save();
    await this.redisCacheService.remove(email);
    return {};
  }

  async generateOTP(generateOTPDto: GenerateOTPDto) {
    const { identifier } = generateOTPDto;
    var otp = Helper.generateToken();
    await this.redisCacheService.set(identifier, otp, { ttl: 300000 });

    const email: CreateEmailDto = {
      subject: 'Confirm OTP',
      template: AppTemplates.VERIFY_ACCOUNT,
      metaData: { code: otp },
      receiverEmail: identifier,
      senderEmail: AppMailSenders.INFO,
    };

    this.eventEmitter.emit(AppEvents.SEND_EMAIl, email);
    return otp;
  }

  async verifyOTP(verifyOTPDto: VerifyOTPDto) {
    const { code, identifier } = verifyOTPDto;
    const otp = await this.redisCacheService.get(identifier);
    if (otp.data != code) {
      throw new UnauthorizedException('Invalid OTP');
    }
    // await this.redisCacheService.remove(identifier);
    return {};
  }

  async changePassword(changePasswordDto: ChangePasswordDto, user: User) {
    const { oldPassword, password } = changePasswordDto;

    if (!(await user.comparePassword(oldPassword))) throw new BadRequestException('Incorrect password');

    user.password = password;
    // user.code = null;
    await user.handleBeforeInsert();
    await user.save();
    return {};
  }

  async verifyPassword(password: string, user: User) {
    if (!(await user.comparePassword(password))) throw new BadRequestException('Incorrect password');

    return {};
  }

  async updateNotificationToken(fcmToken: string, user: User) {
    user.fcmToken = fcmToken;

    await user.save();

    return { fcmToken };
  }
}
