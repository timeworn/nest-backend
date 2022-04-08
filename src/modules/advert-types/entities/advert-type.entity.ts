import { Entity } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';

@Entity('advert-types')
export class AdvertType extends BasicEntity {}
