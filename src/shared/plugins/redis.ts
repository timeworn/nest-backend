import { CachingConfig } from 'cache-manager';
import { createClient } from 'redis';
import { AppConstants } from '../../constants';

export default class RedisStore {
  static client: any;
  static async connect() {
    // const config: any = {
    //   host: AppConstants.REDIS_HOST,
    //   port: AppConstants.REDIS_PORT,
    //   password: AppConstants.REDIS_PASSWORD,
    //   ttl: 40000000000,
    //   // tls: AppConstants.isProduction ? {} : null,
    //   tls: {},
    // };
    // const client = createClient({
    //   socket: config,
    // });

    const options: any = {
      tls: {
        rejectUnauthorized: false,
      },
    };

    const client = createClient({
      socket: options,
      url: `redis://:${AppConstants.REDIS_PASSWORD}@${AppConstants.REDIS_HOST}:${AppConstants.REDIS_PORT}`,
    });

    await client.connect();

    this.client = client;
  }

  static async get(key: string) {
    const data = await this.client.get(key);
    if (!data) return { status: false };
    return { status: true, data };
  }

  static set(key: string, value: any, options?: CachingConfig) {
    return this.client.set(key, value, options);
  }

  static remove(key: string) {
    return this.client.del(key);
  }
}
