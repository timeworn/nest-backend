import { Column, Entity } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';

@Entity('logistics')
export class Logistic extends BasicEntity {
  @Column()
  logoUrl: string;

  @Column({ default: 'Active' })
  status: string;
}
