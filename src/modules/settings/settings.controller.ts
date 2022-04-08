import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { resolveResponse } from '../../shared/resolvers';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { SubscribeToCategoriesDto } from './dto/subscribe-categories.dto';
import { SetTransactionPinDto } from './dto/transaction-pin.dto';
import { SubscribeToInterestsDto } from './dto/subscribe-interests.dto';
// import {SetTransactionPinDto} from './dto/se'

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Patch()
  updateSettings(
    @Body() updateSettingDto: UpdateSettingDto,
    @CurrentUser() user: User,
  ) {
    return resolveResponse(
      this.settingsService.updateSettings(updateSettingDto, user),
    );
  }

  @Patch('subscribe-to-categories')
  subscribeToCategories(
    @Body() subscribeToCategories: SubscribeToCategoriesDto,
    @CurrentUser() user: User,
  ) {
    const { categoryIds } = subscribeToCategories;
    return resolveResponse(
      this.settingsService.subscribeToCategories(categoryIds, user),
    );
  }

  @Patch('subscribe-to-interests')
  subscribeToInterests(
    @Body() subscribeToInterests: SubscribeToInterestsDto,
    @CurrentUser() user: User,
  ) {
    const { interestIds } = subscribeToInterests;
    return resolveResponse(
      this.settingsService.subscribeToInterests(interestIds, user),
    );
  }

  @Patch('reset-transaction-pin')
  resetTransactionPin(@CurrentUser() user: User) {
    return resolveResponse(this.settingsService.resetTransactionPin(user));
  }

  @Patch('transaction-pin')
  setTransactionPin(
    @Body() setTransactionPinDto: SetTransactionPinDto,
    @CurrentUser() user: User,
  ) {
    // const { transactionPin } = setTransactionPinDto;
    return resolveResponse(
      this.settingsService.setTransactionPin(setTransactionPinDto, user),
    );
  }
}
