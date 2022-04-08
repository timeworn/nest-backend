import { PartialType } from '@nestjs/swagger';
import { CreateSearchParticipantDto } from './create-search-participant.dto';

export class UpdateSearchParticipantDto extends PartialType(CreateSearchParticipantDto) {}
