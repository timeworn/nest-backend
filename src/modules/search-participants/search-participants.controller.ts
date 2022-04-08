import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SearchParticipantsService } from './search-participants.service';
import { CreateSearchParticipantDto } from './dto/create-search-participant.dto';
import { UpdateSearchParticipantDto } from './dto/update-search-participant.dto';

@Controller('search-participants')
export class SearchParticipantsController {
  constructor(private readonly searchParticipantsService: SearchParticipantsService) {}

  @Post()
  create(@Body() createSearchParticipantDto: CreateSearchParticipantDto) {
    return this.searchParticipantsService.create(createSearchParticipantDto);
  }

  @Get()
  findAll() {
    return this.searchParticipantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.searchParticipantsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSearchParticipantDto: UpdateSearchParticipantDto) {
    return this.searchParticipantsService.update(+id, updateSearchParticipantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.searchParticipantsService.remove(+id);
  }
}
