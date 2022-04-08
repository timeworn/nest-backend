import { AuthGuard } from './../../shared/guards/auth.guard';
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { resolveResponse } from '../../shared/resolvers';
import { User } from '../users/entities/user.entity';
import { RequestMembershipService } from './request-membership.service';
import { CreateMembershipRequestDto } from './dto/create-request.dto';

@Controller('request-membership')
@ApiTags('Request Membership')
@ApiBearerAuth()
export class RequestMembershipController {
  constructor(private readonly requestMembershipService: RequestMembershipService) {}
  @ApiOperation({ summary: 'Request membership for a corporate account' })
  @Post()
  @UseGuards(AuthGuard)
  requestMembership(@Body() createMembershipDto: CreateMembershipRequestDto, @CurrentUser() user: User) {
    return resolveResponse(this.requestMembershipService.requestMembership(createMembershipDto, user), 'Cooperate request sent');
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all requests' })
  ///Todo: Add permission to allow only normal users
  findAll(@Query() pagination: AbstractPaginationDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.requestMembershipService.findAll(pagination, {
        userId: user.id,
        status: false,
      }),
    );
  }

  @Post('/accept/:id')
  @ApiOperation({ summary: 'Accept request' })
  accept(@Param('id') id: string) {
    return resolveResponse(this.requestMembershipService.acceptMembership(id), 'Request accepted');
  }

  @Post('/decline/:id')
  @ApiOperation({ summary: 'Decline request' })
  decline(@Param('id') id: string) {
    return resolveResponse(this.requestMembershipService.declineMembership(id), 'Request declined');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one request' })
  findOne(@Param('id') id: string) {
    return resolveResponse(this.requestMembershipService.findOne(id));
  }
}
