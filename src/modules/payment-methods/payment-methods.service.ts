import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService extends AbstractService<PaymentMethod> {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodsRepo: Repository<PaymentMethod>,
  ) {
    super();
    this.repository = this.paymentMethodsRepo;
    this.modelName = 'Payment method';
  }
}
