import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { WalletTypesService } from './wallet-types.service';
import { CreateWalletTypeDto } from './dto/create-wallet-type.dto';
import { UpdateWalletTypeDto } from './dto/update-wallet-type.dto';
import { ApiTags } from '@nestjs/swagger';
import { resolveResponse } from '../../shared/resolvers';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';

@ApiTags('Wallet Types')
@Controller('wallet-types')
export class WalletTypesController {
  constructor(private readonly walletTypesService: WalletTypesService) {}

  @Post()
  create(@Body() createWalletTypeDto: CreateWalletTypeDto) {
    return resolveResponse(this.walletTypesService.create(createWalletTypeDto));
  }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto) {
    return resolveResponse(this.walletTypesService.findAll(pagination));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.walletTypesService.findOne(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWalletTypeDto: UpdateWalletTypeDto,
  ) {
    return resolveResponse(
      this.walletTypesService.update(id, updateWalletTypeDto),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.walletTypesService.remove(id));
  }
}
