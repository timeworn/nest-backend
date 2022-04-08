import { Column, Entity } from 'typeorm';
import { BasicEntity } from '../../../shared/entities/basic-entity';
import { PaymentMethodStatus } from '../enum/payment-method-status.enum';

@Entity('payment-methods')
export class PaymentMethod extends BasicEntity {
  @Column('float')
  fee: number;

  @Column('enum', {
    enum: PaymentMethodStatus,
    default: PaymentMethodStatus.Inactive,
  })
  status: string;
}
