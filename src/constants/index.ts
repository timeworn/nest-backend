import * as env from 'env-var';
import * as dotenv from 'dotenv';
import * as path from 'path';

const configPath = path.join(__dirname, `/../../.env.${process.env.NODE_ENV}`);

dotenv.config({
  // path: configPath,
});

export class AppConstants {
  static CLIQ_TOKEN_VALUE: number = env.get('CLIQ_TOKEN_VALUE').asFloat();
  static JWT_SECRET: string = env.get('JWT_SECRET').asString();
  static TYPEORM_SYNCHRONIZE: boolean = env.get('TYPEORM_SYNCHRONIZE').asBool();
  static TYPEORM_URL: string = env.get('TYPEORM_URL').asString();
  static REDIS_HOST: string = env.get('REDIS_HOST').asString();
  static REDIS_PORT: number = env.get('REDIS_PORT').asInt();
  static REDIS_PASSWORD: string = env.get('REDIS_PASSWORD').asString();
  static THRESHOLD_BASE_URL: string = env.get('THRESHOLD_BASE_URL').asString();
  static THRESHOLD_MAIN_WALLET_ID: number = env.get('THRESHOLD_MAIN_WALLET_ID').asInt();
  static THRESHOLD_MAIN_WALLET_CODE: string = env.get('THRESHOLD_MAIN_WALLET_CODE').asString();
  static THRESHOLD_MAIN_WALLET_SECRET: string = env.get('THRESHOLD_MAIN_WALLET_SECRET').asString();
  static THRESHOLD_BTC_WALLET_SECRET: string = env.get('THRESHOLD_BTC_WALLET_SECRET').asString();
  static THRESHOLD_BTC_WALLET_CODE: string = env.get('THRESHOLD_BTC_WALLET_CODE').asString();
  static THRESHOLD_BTC_WALLET_ID: number = env.get('THRESHOLD_BTC_WALLET_ID').asInt();
  static THRESHOLD_BSC_WALLET_SECRET: string = env.get('THRESHOLD_BSC_WALLET_SECRET').asString();
  static THRESHOLD_BSC_WALLET_CODE: string = env.get('THRESHOLD_BSC_WALLET_CODE').asString();
  static THRESHOLD_BSC_WALLET_ID: number = env.get('THRESHOLD_BSC_WALLET_ID').asInt();
  static THRESHOLD_CLIQ_TOKEN_WALLET_SECRET: string = env.get('THRESHOLD_CLIQ_TOKEN_WALLET_SECRET').asString();
  static THRESHOLD_CLIQ_TOKEN_WALLET_CODE: string = env.get('THRESHOLD_CLIQ_TOKEN_WALLET_CODE').asString();
  static THRESHOLD_CLIQ_TOKEN_WALLET_ID: number = env.get('THRESHOLD_CLIQ_TOKEN_WALLET_ID').asInt();
  static PAYSTACK_API_KEY: string = env.get('PAYSTACK_API_KEY').asString();
  static FIXER_URL: string = env.get('FIXER_URL').asString();
  static FIXER_API_KEY: string = env.get('FIXER_API_KEY').asString();
  static FIXER_BASE_CURRENCY: string = env.get('FIXER_BASE_CURRENCY').asString();
  static CRYPTO_COMPARE_API_KEY: string = env.get('CRYPTO_COMPARE_API_KEY').asString();
  static BSC_CONTRACT_ADDRESS: string = env.get('BSC_CONTRACT_ADDRESS').asString();
  static THRESHOLD_ORDER_ID: string = env.get('THRESHOLD_ORDER_ID').asString();
  static PAYSTACK_API_URL: string = env.get('PAYSTACK_API_URL').asString();
  static FLUTTERWAVE_API_URL: string = env.get('FLUTTERWAVE_API_URL').asString();
  static FLUTTERWAVE_API_KEY: string = env.get('FLUTTERWAVE_API_KEY').asString();
  static GOKADA_API_URL: string = env.get('GOKADA_API_URL').asString();
  static GOKADA_API_KEY: string = env.get('GOKADA_TEST_API_KEY').asString();
  static NODE_ENV: string = env.get('NODE_ENV').asString();
  static MAILGUN_API_KEY: string = env.get('MAILGUN_API_KEY').asString();
  static MAILGUN_DOMAIN: string = env.get('MAILGUN_DOMAIN').asString();
  static LATOKEN_API_URL: string = env.get('LATOKEN_API_URL').asString();
  static LATOKEN_PUBLIC_KEY: string = env.get('LATOKEN_PUBLIC_KEY').asString();
  static LATOKEN_PRIVATE_KEY: string = env.get('LATOKEN_PRIVATE_KEY').asString();
  static WEBHOOK_PAYSTACK_KEY: string = env.get('WEBHOOK_PAYSTACK_KEY').asString();
  static WEBHOOK_THRESHOLD_KEY: string = env.get('WEBHOOK_THRESHOLD_KEY').asString();

  static get isProduction(): boolean {
    return AppConstants.NODE_ENV == 'production';
  }
}
