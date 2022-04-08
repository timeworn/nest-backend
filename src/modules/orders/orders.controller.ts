import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { resolveResponse } from '../../shared/resolvers';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: User) {
    return resolveResponse(this.ordersService.create(createOrderDto, user));
  }

  @Post('create-with-wallet')
  createWithWallet(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: User) {
    return resolveResponse(this.ordersService.createWithWallet(createOrderDto, user));
  }

  @Post('create-with-card')
  createWithCard(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: User) {
    return resolveResponse(this.ordersService.createWithCard(createOrderDto, user));
  }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto, @CurrentUser() user: User) {
    return resolveResponse(this.ordersService.findAll(pagination, user));
  }

  @Patch('complete-order/:id')
  completeOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.ordersService.completeOrder(id, user));
  }

  @Patch('dispatch-order/:id')
  dispatchOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.ordersService.dispatchOrder(id, user));
  }

  @Patch('review-order/:id')
  reviewProduct(@Param('id') id: string, @Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
    return resolveResponse(this.ordersService.reviewOrder(id, createReviewDto, user));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.ordersService.findOne(id));
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
  //   return resolveResponse(this.ordersService.update(id, updateOrderDto));
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return resolveResponse(this.ordersService.remove(id));
  // }
}
