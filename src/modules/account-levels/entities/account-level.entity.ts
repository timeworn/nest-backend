import { Column, Entity } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';

@Entity('account-levels')
export class AccountLevel extends BasicEntity {
  @Column()
  level: string;
}
