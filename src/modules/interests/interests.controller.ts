import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { resolveResponse } from '../../shared/resolvers';
import { AuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('Interests')
@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createInterestDto: CreateInterestDto) {
    return resolveResponse(this.interestsService.create(createInterestDto));
  }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto) {
    return resolveResponse(this.interestsService.findAll(pagination));
  }

  @Get('/list/get')
  list() {
    return resolveResponse(this.interestsService.list());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.interestsService.findOne(id));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterestDto: UpdateInterestDto,
  ) {
    return resolveResponse(this.interestsService.update(id, updateInterestDto));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.interestsService.remove(id));
  }
}
