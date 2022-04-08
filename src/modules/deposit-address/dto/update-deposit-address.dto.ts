import { PartialType } from '@nestjs/swagger';
import { CreateDepositAddressDto } from './create-deposit-address.dto';

export class UpdateDepositAddressDto extends PartialType(CreateDepositAddressDto) {}
