import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { User } from '../users/entities/user.entity';
import { DepositAddressService } from './deposit-address.service';
import { CreateDepositAddressDto } from './dto/create-deposit-address.dto';
import { UpdateDepositAddressDto } from './dto/update-deposit-address.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Deposit Addresses')
@Controller('deposit-address')
export class DepositAddressController {
  constructor(private readonly depositAddressService: DepositAddressService) {}

  // @Post()
  // create(@Body() createDepositAddressDto: CreateDepositAddressDto) {
  //   return resolveResponse(this.depositAddressService.create(createDepositAddressDto));
  // }

  // @Get()
  // findAll(@Query() pagination: AbstractPaginationDto) {
  //   return resolveResponse(this.depositAddressService.findAll(pagination));
  // }

  @Get()
  list(@CurrentUser() user: User) {
    return resolveResponse(this.depositAddressService.list(user));
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return resolveResponse(this.depositAddressService.findOne(id));
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDepositAddressDto: UpdateDepositAddressDto) {
  //   return resolveResponse(this.depositAddressService.update(id, updateDepositAddressDto));
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return resolveResponse(this.depositAddressService.remove(id));
  // }
}
