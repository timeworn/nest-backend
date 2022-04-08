import { AuthGuard } from './../../shared/guards/auth.guard';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { resolveResponse } from '../../shared/resolvers';
import { User } from '../users/entities/user.entity';
import { CorporateAccountService } from './corporate-account.service';
import { CreateCorporateAccountDto, GenerateUserLinkDto } from './dto/create-corporate-account.dto';
import { UpdateCorporateAccountDto } from './dto/update-corporate-account.dto';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';

@Controller('corporate-account')
@ApiTags('Corporate Account')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CorporateAccountController {
  constructor(private readonly corporateAccountService: CorporateAccountService) {}

  @Post()
  create(@Body() createCorporateAccountDto: CreateCorporateAccountDto) {
    return this.corporateAccountService.create(createCorporateAccountDto);
  }

  // @Get()
  // findAll() {
  //   return resolveResponse(this.corporateAccountService.getLink(user));
  // }

  @Get()
  @ApiOperation({ summary: 'Get all member' })
  findAll(@Query() pagination: AbstractPaginationDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.corporateAccountService.findAll(pagination, {
        memberId: user.id,
      }),
    );
  }

  @ApiOperation({ summary: 'Get link for corprate account' })
  @Get('/member-link/get')
  getLink(@CurrentUser() user: User) {
    return resolveResponse(this.corporateAccountService.getLink(user));
  }

  @ApiOperation({ summary: 'Generate link for corprate account' })
  @Get('/generate-link')
  generateLink(@CurrentUser() user: User) {
    return resolveResponse(this.corporateAccountService.generateLink(user));
  }

  @Post('/create-link')
  @ApiOperation({ summary: 'Create a membership link for a particular user' })
  createLink(@Body() payload: GenerateUserLinkDto, @CurrentUser() corporate: User) {
    return resolveResponse(this.corporateAccountService.generateUserLink(payload.userId, corporate));
  }
}
