import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { BanksService } from './banks.service';
import { CreateBankDto } from './dto/create-bank.dto';
import { UpdateBankDto } from './dto/update-bank.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Banks')
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Post()
  create(@Body() createBankDto: CreateBankDto) {
    return resolveResponse(this.banksService.create(createBankDto));
  }

  // @Get()
  // findAll() {
  //   return resolveResponse(this.banksService.findAll());
  // }

  @Get()
  list() {
    return resolveResponse(this.banksService.list());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.banksService.findOne(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBankDto: UpdateBankDto) {
    return resolveResponse(this.banksService.update(id, updateBankDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.banksService.remove(id));
  }
}
