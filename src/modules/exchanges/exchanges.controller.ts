import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { UpdateExchangeDto } from './dto/update-exchange.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { resolveResponse } from '../../shared/resolvers';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Exchanges')
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  create(@Body() createExchangeDto: CreateExchangeDto) {
    return resolveResponse(this.exchangesService.create(createExchangeDto));
  }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto) {
    return resolveResponse(this.exchangesService.findAll(pagination, { enabled: true }));
  }

  @Get('/list/get')
  list() {
    return resolveResponse(this.exchangesService.list({ enabled: true }));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.exchangesService.findOne(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExchangeDto: UpdateExchangeDto) {
    return resolveResponse(this.exchangesService.update(id, updateExchangeDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.exchangesService.remove(id));
  }
}
