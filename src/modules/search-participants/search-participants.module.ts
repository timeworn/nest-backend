import { Module } from '@nestjs/common';
import { SearchParticipantsService } from './search-participants.service';
import { SearchParticipantsController } from './search-participants.controller';

@Module({
  controllers: [SearchParticipantsController],
  providers: [SearchParticipantsService]
})
export class SearchParticipantsModule {}
