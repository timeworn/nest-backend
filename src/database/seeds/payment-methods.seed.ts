import { Connection, getConnection } from 'typeorm';
import { Seeder, Factory } from 'typeorm-seeding';
import { PaymentMethod } from '../../modules/payment-methods/entities/payment-method.entity';

export default class AppSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const entities = [PaymentMethod];

    for (const singleEntity of entities) {
      const repository = getConnection().getRepository(singleEntity);
      await repository.query(
        `TRUNCATE TABLE "${repository.metadata.tableName}" CASCADE;`,
      );
    }

    await connection
      .createQueryBuilder()
      .insert()
      .into(PaymentMethod)
      .values([
        {
          id: 'bd95e902-2836-4419-b1d9-3d65a4a94767',
          createdAt: '2021-08-21T15:47:03.223Z',
          updatedAt: '2021-08-21T15:47:03.223Z',
          deletedAt: null,
          name: 'Card',
          slug: 'card',
          description: 'Card payment',
          fee: 1.5,
          status: 'Inactive',
        },
        {
          id: '2b67d36c-6f5c-4208-8afd-8ba1d46fa319',
          createdAt: '2021-08-21T15:48:02.983Z',
          updatedAt: '2021-08-21T15:48:02.983Z',
          deletedAt: null,
          name: 'Bank transfer',
          slug: 'bank_transfer',
          description: 'Bank transfer',
          fee: 2.5,
          status: 'Inactive',
        },
        {
          id: '6445e853-b6da-4b28-8a49-1fc9a4822b73',
          createdAt: '2021-08-21T15:48:43.917Z',
          updatedAt: '2021-08-21T15:48:43.917Z',
          deletedAt: null,
          name: 'Crypto',
          slug: 'crypto',
          description: 'Crypto',
          fee: 1.6,
          status: 'Inactive',
        },
      ])
      .execute();
  }
}
