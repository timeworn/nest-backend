import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { getConnection, getRepository } from 'typeorm';
import { RegisterAccountDto } from '../modules/auth/auth.dto';
import { Category } from '../modules/categories/entities/category.entity';
import { CreateProductDto } from '../modules/products/dto/create-product.dto';
import { ProductsService } from '../modules/products/products.service';
import { Role } from '../modules/roles/entities/role.entity';
import { Setting } from '../modules/settings/entities/setting.entity';
import { Transaction } from '../modules/transactions/entities/transaction.entity';
import { TransactionOperations, TransactionStatus, TransactionTypes } from '../modules/transactions/enums/transactions.enum';
import { User } from '../modules/users/entities/user.entity';
import { WalletType } from '../modules/wallet-types/entities/wallet-type.entity';
import { WalletTypes } from '../modules/wallet-types/enums/wallet-types.enum';
import { Wallet } from '../modules/wallets/entities/wallet.entity';
import { AppCurrency } from '../shared/enums/app-currency.enum';
import { Helper, log } from '../shared/helpers';
import { appCategories } from './data';
import { FormerDataModel, FormerResultModel } from './former-data.models';

@Injectable()
export default class DataMigrationService {
  constructor(private readonly productsService: ProductsService) {}

  async fetchData(): Promise<FormerDataModel> {
    const response = await axios.get('http://localhost:3001/');
    return response.data as FormerDataModel;
  }

  async processData() {
    const data: FormerDataModel = await this.fetchData();
    const { result, parsedUsers } = data;

    const { roles } = result;

    const appRoles = [];
    // const appCategories = [];

    for (const item of roles) {
      let role;
      if (item.name == 'admin') {
        role = await getRepository(Role).findOne({ where: { slug: 'administrator' } });
      }

      if (item.name == 'user') {
        role = await getRepository(Role).findOne({ where: { slug: 'user' } });
      }

      if (item.name == 'cooperate_user') {
        role = await getRepository(Role).findOne({ where: { slug: 'corporate_user' } });
      }

      appRoles.push({
        ...role,
        formerId: item.id,
      });
    }

    // for (const item of categories) {
    //   const category = await getRepository(Category).findOne({ where: { name: item.name } });

    //   appCategories.push({
    //     ...category,
    //     formerId: item.id,
    //   });
    //   // await new Promise((resolve) => setTimeout(resolve, 1000));
    // }

    // return appCategories;

    // console.log(appRoles);
    // console.log(appCategories);

    const appUsers = [];

    const walletTypes = await getRepository(WalletType).find();

    for (const item of parsedUsers) {
      // await getConnection().close();
      // await getConnection().connect();
      const exist = await getRepository(User).findOne({ where: { email: item.email } });
      if (exist) {
        appUsers.push({
          ...exist,
          formerId: item.id,
        });
        continue;
      }
      const registerAccountDto: RegisterAccountDto = {
        email: item.email,
        password: item.password,
        roleId: findByFormerId(appRoles, item.role_id, 'id'),
        firstName: item.first_name,
        lastName: item.last_name,
        phoneNumber: item.phone_number,
        country: 'Nigeria',
        countryCode: 'NG',
        dialCode: '+234',
        avatar: 'https://www.focusedu.org/wp-content/uploads/2018/12/circled-user-male-skin-type-1-2.png',
        username: Helper.generateToken(8, { alphabets: true, digits: true, upperCase: true }),
        referralCode: Helper.string(8),
      };

      const queryRunner = getConnection().createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        let user = queryRunner.manager.create(User, {
          ...registerAccountDto,
        });

        await queryRunner.manager.save(user);

        // log('stored user in transaction');

        const wallets: Partial<Wallet>[] = [];

        for (const walletType of walletTypes) {
          wallets.push({
            balance: 0,
            // balance: walletType.slug == WalletTypes.CLIQ_TOKEN ? item.coin_balance : 0,
            userId: user.id,
            walletTypeId: walletType.id,
          });
        }

        await queryRunner.manager.insert(Wallet, wallets);

        //log('stored wallets in transaction');

        const settings = queryRunner.manager.create(Setting, {
          userId: user.id,
        });

        await queryRunner.manager.save(settings);

        await queryRunner.manager.update(User, { id: user.id }, { settingId: settings.id });

        //log('saved settings information');

        await queryRunner.commitTransaction();

        //log('commited user create transaction');

        // await new Promise((resolve) => setTimeout(resolve, 2000));

        const appUser = await getRepository(User).findOne({ where: { email: item.email } });

        //log('found user information');
        appUsers.push({
          ...appUser,
          formerId: item.id,
        });
        log(`successfully saved user with email ${item.email}`);
        // await getConnection().close();
        // await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (e) {
        log(`could not process user with email ${item.email}`);
        console.log(e);
        await queryRunner.rollbackTransaction();
        // continue;
      } finally {
        await queryRunner.release();
      }
    }

    const appProducts = [];

    const appTransactions = [];

    console.log('processing products and transactions');

    for (const item of parsedUsers) {
      const user = findByFormerId(appUsers, item.id);
      if (!user) continue;

      const wallets = await getRepository(Wallet).find({ where: { userId: user.id } });

      for (let prod of item.products) {
        if (!prod.location.coordinates[1] || !prod.location.coordinates[0] || !findByFormerId(appCategories, prod.category_id, 'id')) {
          continue;
        }

        if (prod.price == 'null') prod.price = 0;

        const createProductDto: CreateProductDto = {
          amount: prod.price ? prod.price : 0,
          categoryIds: [findByFormerId(appCategories, prod.category_id, 'id')],
          description: prod.description,
          lat: prod.location.coordinates[1] ?? 0,
          lng: prod.location.coordinates[0] ?? 0,
          name: prod.offering,
          currency: 'NGN',
          tagIds: [],
          images: ['https://htifiltration.com/wp-content/uploads/2013/04/product-placeholder.jpg'],
          address: '',
          published: false,
        };

        // console.log(createProductDto);
        const product = await this.productsService.create(createProductDto, user);
        product.published = false;
        await product.save();
        console.log({ productId: product.id });
        appProducts.push(product);
        // await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      for (const tranc of item.transactions) {
        const payload: Partial<Transaction> = {
          amount: tranc.coin ? tranc.coin : 0,
          currency: AppCurrency.CLIQ_TOKEN,
          metadata: {
            recipient: 'Self',
            username: user.username,
            currentBalance: 0,
            previousBalance: 0,
            transactionFee: 0,
          },
          serverMetadata: {},
          method: 'unknown',
          reference: Helper.faker.datatype.uuid(),
          type: TransactionTypes.WALLET_TRANSACTION,
          operation: tranc.type == 'credit' ? TransactionOperations.CREDIT : TransactionOperations.DEBIT,
          status: TransactionStatus.SUCCESSFUL,
          accessCode: null,
          charges: 0,
          url: null,
          userId: user.id,
          walletId: wallets.find((x) => x.walletType.slug == WalletTypes.CLIQ_TOKEN)?.id,
        };

        const transaction = await getRepository(Transaction).save(payload);
        console.log({ transactionId: transaction.id });
        appTransactions.push(transaction);
        // await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    return { appUsers, appProducts, appTransactions };
  }
}

const findByFormerId = (data: any[], formerId: string, key?: string) => {
  const result = data.find((x) => x.formerId == formerId);

  if (!result) return null;

  return key ? result[key] : result;
};
