import { Connection, getConnection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import * as faker from 'faker';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { WalletType } from '../../modules/wallet-types/entities/wallet-type.entity';
import { AccountLevel } from '../../modules/account-levels/entities/account-level.entity';
import { Exchange } from '../../modules/exchanges/entities/exchange.entity';

export default class AppSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const entities = [Role, User, WalletType, AccountLevel, Exchange];

    for (const singleEntity of entities) {
      const repository = getConnection().getRepository(singleEntity);
      await repository.query(`TRUNCATE TABLE "${repository.metadata.tableName}" CASCADE;`);
    }

    await connection
      .createQueryBuilder()
      .insert()
      .into(Role)
      .values([
        {
          id: 'cbe9a461-8369-453e-a5be-29c403b03ed0',
          name: 'Administrator',
          description: 'Administrator Role',
          slug: 'administrator',
        },
        {
          id: '1b6d3b36-5158-4fc4-9cf7-edaf37714b00',
          name: 'User',
          description: 'User Role',
          slug: 'user',
        },
        {
          id: 'e10ecc87-64e5-4b40-9f10-69e0dfa94a8a',
          name: 'Corporate User',
          description: 'Corporate Role',
          slug: 'corporate_user',
        },
      ])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        {
          firstName: 'Admin',
          lastName: 'Admin',
          email: 'admin@spottr.com',
          username: 'admin',
          password: '$2b$10$nAcoWCCNoPXuIgfOfJM86OK1GW9cEW6qhLKYkHC/bEffARLpdRZHC',
          roleId: 'cbe9a461-8369-453e-a5be-29c403b03ed0',
          phoneNumber: faker.phone.phoneNumber(),
          country: 'Nigeria',
        },
      ])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(WalletType)
      .values([
        {
          name: 'Fiat Wallet',
          slug: 'fiat_wallet',
          description: 'Fiat Wallet',
          currency: 'NGN',
        },
        {
          name: 'Cliq Token',
          slug: 'cliq_token',
          description: 'Cliq Token',
          currency: 'CT',
        },
        { name: 'SUSD', slug: 'susd', description: 'SUSD', currency: 'USD', status: 'Deactivated' },
      ])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(Exchange)
      .values([
        {
          id: '28820254-b67e-439b-b416-e3699a822c91',
          createdAt: '2021-11-11T00:05:03.958Z',
          updatedAt: '2021-11-11T00:05:03.958Z',
          deletedAt: null,
          name: 'Binance',
          slug: 'binance',
          description: 'Binance',
          link: 'https://www.binance.com/',
          enabled: false,
        },
        {
          id: '4804c5ac-b559-46f1-b171-a80c363af296',
          createdAt: '2021-11-11T00:05:15.857Z',
          updatedAt: '2021-11-11T00:05:15.857Z',
          deletedAt: null,
          name: 'Buycoins',
          slug: 'buycoins',
          description: 'Buycoins',
          link: 'https://buycoins.africa/',
          enabled: false,
        },
        {
          id: '6b6b915c-9ff2-4ae2-93f8-00f147fcf465',
          createdAt: '2021-11-11T00:05:27.627Z',
          updatedAt: '2021-11-11T00:05:27.627Z',
          deletedAt: null,
          name: 'Coinbase',
          slug: 'coinbase',
          description: 'Coinbase',
          link: 'https://www.coinbase.com/',
          enabled: false,
        },
        {
          id: 'f6130493-bb9f-4962-97ce-3c6ad69cecec',
          createdAt: '2021-11-11T00:05:27.627Z',
          updatedAt: '2021-11-11T00:05:27.627Z',
          deletedAt: null,
          name: 'Latoken',
          slug: 'latoken',
          description: 'Latoken',
          link: 'https://www.latoken.com/',
          enabled: true,
        },
      ])
      .execute();

    await connection
      .createQueryBuilder()
      .insert()
      .into(AccountLevel)
      .values([
        {
          id: '9ea648a2-2668-4000-946a-5dcbc69477fc',
          createdAt: '2021-09-10T02:26:33.194Z',
          updatedAt: '2021-09-10T02:26:33.194Z',
          deletedAt: null,
          name: 'Spottr Agent Network',
          slug: 'spottr_agent_network',
          description: 'To become a verified spottr user, your email address and phone number must be verified.',
          level: 'Level One',
        },
        {
          id: '5e4feaa3-a8f0-489f-a84f-7f16314c65dd',
          createdAt: '2021-09-10T02:26:55.087Z',
          updatedAt: '2021-09-10T02:26:55.087Z',
          deletedAt: null,
          name: 'Spottr Network and Loan',
          slug: 'spottr_network_and_loan',
          description: 'To become a verified spottr user, your email address and phone number must be verified.',
          level: 'Level Two',
        },
        {
          id: '8dfd56b5-9514-4679-b6c3-d37eb4d48c48',
          createdAt: '2021-09-10T02:27:04.456Z',
          updatedAt: '2021-09-10T02:27:04.456Z',
          deletedAt: null,
          name: 'Spottr Peer-to-Peer Agent',
          slug: 'spottr_peer-to-peer_agent',
          description: 'To become a verified spottr user, your email address and phone number must be verified.',
          level: 'Level Three',
        },
      ])
      .execute();

    // await connection
    // .createQueryBuilder()
    // .insert()
    // .into()
    // .values([

    // ])
    // .execute();
  }
}
