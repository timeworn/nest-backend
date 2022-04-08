import { Injectable } from '@nestjs/common';
import { CreateSearchParticipantDto } from './dto/create-search-participant.dto';
import { UpdateSearchParticipantDto } from './dto/update-search-participant.dto';

@Injectable()
export class SearchParticipantsService {
  create(createSearchParticipantDto: CreateSearchParticipantDto) {
    return 'This action adds a new searchParticipant';
  }

  findAll() {
    return `This action returns all searchParticipants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} searchParticipant`;
  }

  update(id: number, updateSearchParticipantDto: UpdateSearchParticipantDto) {
    return `This action updates a #${id} searchParticipant`;
  }

  remove(id: number) {
    return `This action removes a #${id} searchParticipant`;
  }
}
