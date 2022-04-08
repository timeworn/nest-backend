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
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Payment Methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return resolveResponse(
      this.paymentMethodsService.create(createPaymentMethodDto),
    );
  }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto) {
    return resolveResponse(this.paymentMethodsService.findAll(pagination));
  }

  @Get('/list/get')
  list() {
    return resolveResponse(this.paymentMethodsService.list());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.paymentMethodsService.findOne(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto,
  ) {
    return resolveResponse(
      this.paymentMethodsService.update(id, updatePaymentMethodDto),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.paymentMethodsService.remove(id));
  }
}
