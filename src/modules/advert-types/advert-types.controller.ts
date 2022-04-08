import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { AdvertTypesService } from './advert-types.service';
import { CreateAdvertTypeDto } from './dto/create-advert-type.dto';
import { UpdateAdvertTypeDto } from './dto/update-advert-type.dto';

@UseGuards(AuthGuard)
@ApiTags('Advert Types')
@Controller('advert-types')
export class AdvertTypesController {
  constructor(private readonly advertTypesService: AdvertTypesService) {}

  @Post()
  create(@Body() createAdvertTypeDto: CreateAdvertTypeDto) {
    return resolveResponse(this.advertTypesService.create(createAdvertTypeDto));
  }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto) {
    return resolveResponse(this.advertTypesService.findAll(pagination));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.advertTypesService.findOne(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdvertTypeDto: UpdateAdvertTypeDto,
  ) {
    return resolveResponse(
      this.advertTypesService.update(id, updateAdvertTypeDto),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.advertTypesService.remove(id));
  }
}
