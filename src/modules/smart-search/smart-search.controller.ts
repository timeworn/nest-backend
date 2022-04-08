import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SmartSearchService } from './smart-search.service';
import { CreateSmartSearchDto } from './dto/create-smart-search.dto';
import { UpdateSmartSearchDto } from './dto/update-smart-search.dto';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { resolveResponse } from '../../shared/resolvers';
import { JoinSmartSearchDto } from './dto/join-smart-search.dto';

@ApiBearerAuth()
@ApiTags('Smart Search')
@UseGuards(AuthGuard)
@Controller('smart-search')
export class SmartSearchController {
  constructor(private readonly smartSearchService: SmartSearchService) {}

  @Post()
  create(@Body() createSmartSearchDto: CreateSmartSearchDto, @CurrentUser() user: User) {
    return resolveResponse(
      this.smartSearchService.create({
        ...createSmartSearchDto,
        createdById: user.id,
      }),
    );
  }

  // @Get()
  // findAll() {
  //   return resolveResponse(this.smartSearchService.findAll());
  // }

  @Get()
  list(@CurrentUser() user: User) {
    return resolveResponse(this.smartSearchService.list(user));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.smartSearchService.findOne(id));
  }

  @Patch(':id/join')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() joinSmartSearchDto: JoinSmartSearchDto,
  ) {
    return resolveResponse(this.smartSearchService.join(id, user, joinSmartSearchDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.smartSearchService.remove(id));
  }
}
