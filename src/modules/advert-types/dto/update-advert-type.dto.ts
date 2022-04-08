import { PartialType } from '@nestjs/swagger';
import { CreateAdvertTypeDto } from './create-advert-type.dto';

export class UpdateAdvertTypeDto extends PartialType(CreateAdvertTypeDto) {}
