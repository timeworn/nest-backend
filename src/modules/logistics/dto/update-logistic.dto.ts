import { PartialType } from '@nestjs/swagger';
import { CreateLogisticDto } from './create-logistic.dto';

export class UpdateLogisticDto extends PartialType(CreateLogisticDto) {}
