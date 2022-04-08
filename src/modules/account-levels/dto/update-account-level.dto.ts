import { PartialType } from '@nestjs/swagger';
import { CreateAccountLevelDto } from './create-account-level.dto';

export class UpdateAccountLevelDto extends PartialType(CreateAccountLevelDto) {}
