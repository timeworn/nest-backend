import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { User } from '../users/entities/user.entity';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Bank Accounts')
@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Post()
  create(@Body() createBankAccountDto: CreateBankAccountDto, @CurrentUser() user: User) {
    return resolveResponse(this.bankAccountsService.create(createBankAccountDto, user));
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return resolveResponse(this.bankAccountsService.findAllByUser(user));
  }

  // @Get()
  // findAll(@Query() pagination: AbstractPaginationDto, @CurrentUser() user: User) {
  //   return resolveResponse(this.bankAccountsService.findAll(pagination, { userId: user.id }));
  // }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.bankAccountsService.findOneByUser(id, user.id));
  }

  @Patch(':id/make-default')
  makeDefault(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.bankAccountsService.makeDefault(id, user));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.bankAccountsService.remove(id, user));
  }
}
