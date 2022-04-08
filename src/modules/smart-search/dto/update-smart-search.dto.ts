import { PartialType } from '@nestjs/swagger';
import { CreateSmartSearchDto } from './create-smart-search.dto';

export class UpdateSmartSearchDto extends PartialType(CreateSmartSearchDto) {}
