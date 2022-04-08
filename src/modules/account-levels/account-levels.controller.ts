import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UseAppRoles } from '../../shared/decorators/role.decorator';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AppRoles } from '../roles/enums/roles.enum';
import { AccountLevelsService } from './account-levels.service';
import { CreateAccountLevelDto } from './dto/create-account-level.dto';
import { UpdateAccountLevelDto } from './dto/update-account-level.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@ApiTags('Account Levels')
@Controller('account-levels')
export class AccountLevelsController {
  constructor(private readonly accountLevelsService: AccountLevelsService) {}

  @UseAppRoles(AppRoles.ADMIN)
  @Post()
  create(@Body() createAccountLevelDto: CreateAccountLevelDto) {
    return this.accountLevelsService.create(createAccountLevelDto);
  }

  // @Get()
  // findAll() {
  //   return this.accountLevelsService.findAll();
  // }

  @Get()
  list() {
    return this.accountLevelsService.list();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountLevelsService.findOne(id);
  }

  @UseAppRoles(AppRoles.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountLevelDto: UpdateAccountLevelDto) {
    return this.accountLevelsService.update(id, updateAccountLevelDto);
  }

  @UseAppRoles(AppRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountLevelsService.remove(id);
  }
}
