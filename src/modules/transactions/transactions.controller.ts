import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { resolveResponse } from '../../shared/resolvers';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { FilterTransactionsDto } from './dto/filter-transactions.dto';
import { GenerateTransactionStatementDto } from './dto/generate-transaction-statement.dto';

@ApiBearerAuth()
@ApiTags('Transactions')
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return resolveResponse(this.transactionsService.create(createTransactionDto));
  }

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto, @Query() filter: FilterTransactionsDto, @CurrentUser() user: User, @Req() req) {
    console.log({ query: req.query });
    const { walletId } = filter;
    const query: any = {
      user,
    };

    if (walletId) {
      query.walletId = walletId;
    }

    return resolveResponse(this.transactionsService.findAll(pagination, query));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.transactionsService.findOne(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return resolveResponse(this.transactionsService.update(id, updateTransactionDto));
  }

  @Post('generate-statement')
  generateStatement(@Body() generateStatementDto: GenerateTransactionStatementDto, @CurrentUser() user: User) {
    return resolveResponse(this.transactionsService.generateStatement(user, generateStatementDto));
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.transactionsService.cancel(id, user));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.transactionsService.remove(id));
  }
}
