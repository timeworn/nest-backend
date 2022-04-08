import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Permission } from '../permissions/entities/permission.entity';
import { AddPermissionsToRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService extends AbstractService<Role> {
  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {
    super();
    this.repository = this.roleRepo;
    this.modelName = 'Role';
  }

  async addPermissionsToRole(addPermissionsToRoleDto: AddPermissionsToRoleDto) {
    const { roleId, permissionsId } = addPermissionsToRoleDto;
    const role = await this.findOne(roleId);

    const permissions = await this.resolveRelationships(
      permissionsId,
      Permission,
    );
    // for (const permissionId of permissionsId) {
    //   const permission = await getRepository(Permission).findOne(permissionId);
    //   if (!permission) {
    //     continue;
    //   }
    //   permissions.push(permission);
    // }
    role.permissions = permissions;
    return this.roleRepo.save(role);
  }
}
