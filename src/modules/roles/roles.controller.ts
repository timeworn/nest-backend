import { Controller, Post, Body, Put, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AddPermissionsToRoleDto, UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags } from '@nestjs/swagger';
import { AbstractController } from '../../shared/controllers/abstract-controller.controller';
import { resolveResponse } from '../../shared/resolvers';

@ApiTags('Roles')
@Controller('roles')
export class RolesController extends AbstractController {
  constructor(private readonly rolesService: RolesService) {
    super();
    this.service = this.rolesService;
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return super.create(createRoleDto);
  }

  @Put('update-permissions')
  async addPermissionToRole(
    @Body() addPermissionToRoleDto: AddPermissionsToRoleDto,
  ) {
    return resolveResponse(
      this.rolesService.addPermissionsToRole(addPermissionToRoleDto),
      'Role Permissions Updated',
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return super.update(id, updateRoleDto);
  }
}
