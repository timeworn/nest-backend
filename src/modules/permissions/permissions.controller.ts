import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { PermissionResponse } from './permission.response';
import { AbstractController } from '../../shared/controllers/abstract-controller.controller';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController extends AbstractController {
  constructor(private readonly permissionsService: PermissionsService) {
    super();
    this.service = this.permissionsService;
  }

  @Post()
  create(createPermissionDto: CreatePermissionDto) {
    return super.create(createPermissionDto);
  }

  @Put(':id')
  update(@Param('id') id: string, updatePermissionDto: UpdatePermissionDto) {
    return super.update(id, updatePermissionDto);
  }
}
