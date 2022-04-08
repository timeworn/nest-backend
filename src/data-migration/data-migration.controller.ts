import { Controller, Post } from '@nestjs/common';
import DataMigrationService from './data-migration.service';

@Controller('data-migration')
export class DataMigrationController {
  constructor(private readonly dataMigrationService: DataMigrationService) {}

  @Post('/')
  handleDataMigration() {
    return this.dataMigrationService.processData();
  }
}
