import { Thresh0ldModule } from './integrations/thresh0ld/thresh0ld.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { CategoriesModule } from './modules/categories/categories.module';
import { WalletTypesModule } from './modules/wallet-types/wallet-types.module';
// import { SubCategoriesModule } from './modules/sub-categories/sub-categories.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { DepositAddressModule } from './modules/deposit-address/deposit-address.module';
import { GlobalModule } from './global/global.module';
import { ProductsModule } from './modules/products/products.module';
import { BankAccountsModule } from './modules/bank-accounts/bank-accounts.module';
import { UtilitiesModule } from './modules/utilities/utilities.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { EmailsModule } from './notifications/emails/emails.module';
import { CorporateAccountModule } from './modules/corporate-account/corporate-account.module';
import { SettingsModule } from './modules/settings/settings.module';
import { InterestsModule } from './modules/interests/interests.module';
import { AdvertTypesModule } from './modules/advert-types/advert-types.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { AccountLevelsModule } from './modules/account-levels/account-levels.module';
import { SmartSearchModule } from './modules/smart-search/smart-search.module';
import { WebsocketModule } from './websockets/websocket.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { RequestsModule } from './modules/requests/requests.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LogisticsModule } from './modules/logistics/logistics.module';
import { SearchParticipantsModule } from './modules/search-participants/search-participants.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { DataMigrationModule } from './data-migration/data-migration.module';
import { BanksModule } from './modules/banks/banks.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { BullModule } from '@nestjs/bull';
import { AppConstants } from './constants';
import { NotificationsModule } from './notifications/notifications.module';
import { RequestMembershipModule } from './modules/request-membership/request-membership.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { FirebaseAdminModule } from '@aginix/nestjs-firebase-admin';
import * as admin from 'firebase-admin';
import { CronJobsModule } from './modules/cron-jobs/cron-jobs.module';
import { ReferralTasksModule } from './modules/referral-tasks/referral-tasks.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
const mg = require('nodemailer-mailgun-transport');

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    Thresh0ldModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    BullModule.forRoot({
      redis: {
        host: AppConstants.REDIS_HOST,
        port: AppConstants.REDIS_PORT,
        password: AppConstants.REDIS_PASSWORD,
        tls: AppConstants.isProduction
          ? {
              rejectUnauthorized: false,
            }
          : null,
      },
    }),
    FirebaseAdminModule.forRootAsync({
      useFactory: () => ({
        credential: admin.credential.applicationDefault(),
      }),
    }),
    MailerModule.forRoot({
      transport: mg({
        auth: {
          api_key: AppConstants.MAILGUN_API_KEY,
          domain: AppConstants.MAILGUN_DOMAIN,
        },
      }),
      template: {
        dir: __dirname + '/templates',
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    CategoriesModule,
    WalletTypesModule,
    CronJobsModule,
    WalletsModule,
    DepositAddressModule,
    GlobalModule,
    ProductsModule,
    BankAccountsModule,
    UtilitiesModule,
    EmailsModule,
    CorporateAccountModule,
    SettingsModule,
    InterestsModule,
    AdvertTypesModule,
    PaymentMethodsModule,
    AccountLevelsModule,
    SmartSearchModule,
    WebsocketModule,
    TasksModule,
    TransactionsModule,
    RequestsModule,
    OrdersModule,
    LogisticsModule,
    SearchParticipantsModule,
    MessagesModule,
    ConversationsModule,
    WebhooksModule,
    DataMigrationModule,
    BanksModule,
    ReviewsModule,
    NotificationsModule,
    RequestMembershipModule,
    ExchangesModule,
    ReferralTasksModule,
    ReferralsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
