import { Module } from '@nestjs/common';
import { ProductsModule } from '../modules/products/products.module';
import { DataMigrationController } from './data-migration.controller';
import DataMigrationService from './data-migration.service';

@Module({
  imports: [ProductsModule],
  providers: [DataMigrationService],
  controllers: [DataMigrationController],
})
export class DataMigrationModule {}
