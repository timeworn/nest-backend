import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { AppConstants } from '../../constants';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [
    // CacheModule.registerAsync({
    //   useFactory: async () => ({
    //     store: redisStore,
    //     host: AppConstants.REDIS_HOST,
    //     port: AppConstants.REDIS_PORT,
    //     password: AppConstants.REDIS_PASSWORD,
    //     ttl: 40000000000,
    //   }),
    // }),
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: redisStore,
        host: AppConstants.REDIS_HOST,
        port: AppConstants.REDIS_PORT,
        password: AppConstants.REDIS_PASSWORD,
        ttl: 40000000000,
        tls: AppConstants.isProduction ? {} : null,
        // tls: {},
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [CacheModule, RedisCacheService],
})
export class RedisCacheModule {}
