import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppConstants } from '../constants';

dotenv.config({});

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: AppConstants.TYPEORM_URL,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  // synchronize: true,
  synchronize: AppConstants.TYPEORM_SYNCHRONIZE,
  logging: false,
  dropSchema: false,
  extra: {
    max: 100000000000000,
    connectionLimit: 100000000000000,
  },
  ssl: { rejectUnauthorized: false },
  // ssl: AppConstants.isProduction ? { rejectUnauthorized: false } : null,
};
