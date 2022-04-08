import { Column, Entity } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';

@Entity('exchanges')
export class Exchange extends BasicEntity {
  @Column({ unique: true })
  link: string;

  @Column({ default: true })
  enabled: boolean;
}
