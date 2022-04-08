import { Connection, getConnection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Logistic } from '../../modules/logistics/entities/logistic.entity';

export default class AppSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const entities = [Logistic];

    for (const singleEntity of entities) {
      const repository = getConnection().getRepository(singleEntity);
      await repository.query(`TRUNCATE TABLE "${repository.metadata.tableName}" CASCADE;`);
    }

    await connection
      .createQueryBuilder()
      .insert()
      .into(Logistic)
      .values([
        {
          id: 'b3c1cf33-7985-4d6b-b413-cc5ac02d2466',
          createdAt: '2021-09-22T02:01:20.992Z',
          updatedAt: '2021-09-22T02:01:20.992Z',
          deletedAt: null,
          name: 'Gokada',
          slug: 'gokada',
          description: 'Gokada logistics',
          status: 'Active',
          logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Gokada_logo.png',
        },
      ])
      .execute();
  }
}
