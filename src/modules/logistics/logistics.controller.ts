import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { CreateLogisticDto } from './dto/create-logistic.dto';
import { UpdateLogisticDto } from './dto/update-logistic.dto';
import { resolveResponse } from '../../shared/resolvers';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { FetchFareDto } from './dto/fetch-fare.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Logistics')
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Post()
  create(@Body() createLogisticDto: CreateLogisticDto) {
    return resolveResponse(this.logisticsService.create(createLogisticDto));
  }

  @Get()
  list() {
    return resolveResponse(this.logisticsService.list());
  }

  // @Get()
  // list() {
  //   return resolveResponse(this.logisticsService.list());
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.logisticsService.findOne(id));
  }

  @Get(':id/fetch-fare')
  fetchFareByLogistic(@Param('id') id: string, @Body() fetchFareDto: FetchFareDto) {
    return resolveResponse(this.logisticsService.fetchFareByLogistic(id, fetchFareDto));
  }

  @Post('fetch-fare')
  fetchFare(@Body() fetchFareDto: FetchFareDto) {
    return resolveResponse(this.logisticsService.fetchFare(fetchFareDto));
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLogisticDto: UpdateLogisticDto) {
  //   return resolveResponse(this.logisticsService.update(id, updateLogisticDto));
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return resolveResponse(this.logisticsService.remove(id));
  // }
}
