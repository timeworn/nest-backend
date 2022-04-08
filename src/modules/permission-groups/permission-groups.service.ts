import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { PermissionGroup } from './entities/permission-group.entity';

@Injectable()
export class PermissionGroupsService extends AbstractService<PermissionGroup> {
  constructor(
    @InjectRepository(PermissionGroup)
    private readonly permissionGroupRepo: Repository<PermissionGroup>,
  ) {
    super();
    this.repository = this.permissionGroupRepo;
    this.modelName = 'Permission Group';
  }
}
