import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Unique } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { AppCurrency } from '../../../shared/enums/app-currency.enum';
import { Helper } from '../../../shared/helpers';

@Entity('banks')
@Unique('banks_constraint', ['id', 'slug'])
export class Bank extends BasicEntity {
  @ApiProperty({ example: Helper.faker.image.imageUrl() })
  @Column({ nullable: true })
  logo?: string;

  @ApiProperty({ example: 426 })
  @Column({ nullable: true })
  code: string;

  @ApiProperty({ example: AppCurrency.NAIRA })
  @Column({ default: AppCurrency.NAIRA, nullable: true })
  currency: string;

  @ApiProperty({ example: 'Nigeria' })
  @Column({ default: 'Nigeria', nullable: true })
  country: string;
}
