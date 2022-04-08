import { PartialType } from '@nestjs/swagger';
import { CreateWalletTypeDto } from './create-wallet-type.dto';

export class UpdateWalletTypeDto extends PartialType(CreateWalletTypeDto) {}
