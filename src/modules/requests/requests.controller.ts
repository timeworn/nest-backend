import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto, CreateRequestFromSearchDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { AcceptRequestDto } from './dto/accept-request.dto';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@ApiTags('Requests')
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() createRequestDto: CreateRequestDto, @CurrentUser() customer: User) {
    return resolveResponse(this.requestsService.create(createRequestDto, customer));
  }

  @Post('create-from-search')
  createFromSearch(@Body() createRequestFromSearchDto: CreateRequestFromSearchDto, @CurrentUser() customer: User) {
    return resolveResponse(this.requestsService.createFromSearch(createRequestFromSearchDto, customer));
  }

  @Put('accept-from-chat/:messageId')
  customerAcceptFromChat(@Param('messageId') messageId: string, @CurrentUser() customer: User) {
    return resolveResponse(this.requestsService.customerAcceptFromChat(messageId, customer));
  }

  @Put('decline-from-chat/:messageId')
  customerDeclineFromChat(@Param('messageId') messageId: string, @CurrentUser() customer: User) {
    return resolveResponse(this.requestsService.customerDeclineFromChat(messageId, customer));
  }

  // @Get()
  // findAll() {
  //   return resolveResponse(this.requestsService.findAll());
  // }

  @Get('my-requests')
  myRequests(@CurrentUser() user: User) {
    return resolveResponse(this.requestsService.MyRequests(user));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.requestsService.findOne(id));
  }

  @Patch(':id/vendor-accept')
  acceptRequest(@Param('id') id: string, @Body() acceptRequestDto: AcceptRequestDto, @CurrentUser() user: User) {
    return resolveResponse(this.requestsService.acceptRequest(id, user, acceptRequestDto));
  }

  @Patch(':id/vendor-decline')
  declineRequest(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.requestsService.declineRequest(id, user));
  }

  @Patch(':id/customer-accept')
  customerAccept(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.requestsService.customerAccept(id, user));
  }

  @Patch(':id/customer-decline')
  customerDecline(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.requestsService.customerDecline(id, user));
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRequestDto: UpdateRequestDto) {
  //   return resolveResponse(this.requestsService.update(id, updateRequestDto));
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.requestsService.remove(id));
  }
}
