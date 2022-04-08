import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppMailSenders, AppTemplates } from '../../constants/email';
import { AppEvents } from '../../constants/events';
import { CreateEmailDto } from '../../notifications/emails/dto/create-email.dto';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Category } from '../categories/entities/category.entity';
import { Interest } from '../interests/entities/interest.entity';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { User } from '../users/entities/user.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { SetTransactionPinDto } from './dto/transaction-pin.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService extends AbstractService<Setting> {
  constructor(
    @InjectRepository(Setting) private settingsRepo: Repository<Setting>,
    private readonly redisCacheService: RedisCacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    this.repository = this.settingsRepo;
    this.modelName = 'Setting';
  }

  async updateSettings(updateSettingDto: UpdateSettingDto, user: User) {
    await this.settingsRepo.update({ userId: user.id }, updateSettingDto);
    return this.findOne(user.settingId);
  }

  async subscribeToCategories(categoryIds: string[], user: User) {
    const setting = await this.findOne(user.settingId);
    const categories = await Helper.resolveRelationships(categoryIds, Category);
    setting.subscribedCategories = categories;
    await setting.save();
    return {};
  }

  async subscribeToInterests(interestIds: string[], user: User) {
    const setting = await this.findOne(user.settingId);
    const interests = await Helper.resolveRelationships(interestIds, Interest);
    setting.interests = interests;
    await setting.save();
    return {};
  }

  async resetTransactionPin(user: User) {
    var otp = Helper.generateToken();

    this.eventEmitter.emit(AppEvents.STORE_IN_CACHE, {
      key: user.id,
      value: otp,
    });

    const email: CreateEmailDto = {
      subject: 'Reset Transaction Pin',
      template: AppTemplates.FORGOT_PASSWORD,
      metaData: { code: otp },
      receiverEmail: user.email,
      senderEmail: AppMailSenders.INFO,
    };

    this.eventEmitter.emit(AppEvents.SEND_EMAIl, email);
    return { otp };
  }

  async setTransactionPin(setTransactionPinDto: SetTransactionPinDto, user: User) {
    const { transactionPin, password } = setTransactionPinDto;
    if (!(await user.comparePassword(password))) throw new BadRequestException('Incorrect password');
    // await Helper.verifyOTP(this.redisCacheService, user.id, otp);
    const setting = await this.findOne(user.settingId);
    const hashString = await Helper.hash(transactionPin);
    setting.transactionPin = hashString;
    await setting.save();
    return {};
  }
}
