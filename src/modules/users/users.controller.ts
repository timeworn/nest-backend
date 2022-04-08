import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssignRoleDto } from './dto/assign-role.dto';
import { resolveResponse } from '../../shared/resolvers';
import { UsePermissions } from '../../shared/decorators/permission.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from './entities/user.entity';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { UserFilterDto } from './dto/filter.dto';
import { CheckUsernameDto } from './dto/check-username.dto';

@ApiTags('Users')
@ApiBearerAuth()
// @UseGuards(AuthGuard, PermissionGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UsePermissions('user.create')
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return resolveResponse(this.usersService.create(createUserDto), 'Account Created');
  }

  @Post('assign-role')
  async assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return resolveResponse(this.usersService.assignRole(assignRoleDto), 'Role Assigned');
  }

  @Get('username/:username')
  checkUsername(@Param() checkUsernameDto: CheckUsernameDto) {
    return resolveResponse(this.usersService.checkUsername(checkUsernameDto.username), 'Username is available');
  }

  @Get('search-username/:username')
  findByUsername(@Param('username') username: string) {
    return resolveResponse(this.usersService.findByUsername(username));
  }

  @UseGuards(AuthGuard)
  // @Permissions('user.update')
  @Patch('update-profile')
  updateProfile(@Body() updateUserDto: UpdateUserDto, @CurrentUser() user: User) {
    console.log(updateUserDto);
    return resolveResponse(this.usersService.update(user.id, updateUserDto));
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() pagination: AbstractPaginationDto, @Query() filter: UserFilterDto) {
    return resolveResponse(this.usersService.findAllUsers(pagination, filter));
  }

  @UseGuards(AuthGuard)
  @Get('vendor-stats')
  fetchVendorStats(@CurrentUser() user: User) {
    return resolveResponse(this.usersService.fetchVendorStats(user));
  }

  // @Permissions('user.findOne')
  @Get(':id/profile')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.usersService.fetchUserProfile(id));
  }

  // @Permissions('user.update')
  // @Put(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @Permissions('user.remove')
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }
}
