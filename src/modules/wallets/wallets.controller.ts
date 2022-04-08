import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { resolveResponse } from '../../shared/resolvers';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { FundFiatWallet } from './dto/fund-fiat-wallet.dto';
import { WithdrawFromWalletDto } from './dto/withdraw-from-wallet.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return resolveResponse(this.walletsService.create(createWalletDto));
  }

  @Post('fund-fiat')
  fundFiatWallet(@Body() fundFiatWallet: FundFiatWallet, @CurrentUser() user: User) {
    return resolveResponse(this.walletsService.fundFiatWallet(fundFiatWallet, user));
  }

  @Post('withdraw-token')
  withdrawToken(@Body() withdrawFromWalletDto: WithdrawFromWalletDto, @CurrentUser() user: User) {
    return resolveResponse(this.walletsService.withdrawToken(withdrawFromWalletDto, user));
  }

  // @Get()
  // findAll(@Query() pagination: AbstractPaginationDto) {
  //   return resolveResponse(this.walletsService.findAll(pagination));
  // }

  @Get()
  list(@CurrentUser() user: User) {
    return resolveResponse(this.walletsService.list(user));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.walletsService.findOne(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWalletDto: UpdateWalletDto) {
    return resolveResponse(this.walletsService.update(id, updateWalletDto));
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return resolveResponse(this.walletsService.remove(id));
  // }
}
