import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('Reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // @Post()
  // create(@Body() createReviewDto: CreateReviewDto) {
  //   return this.reviewsService.create(createReviewDto);
  // }

  // @Get()
  // findAll() {
  //   return this.reviewsService.findAll();
  // }

  // @Get()
  // list() {
  //   return this.reviewsService.list();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reviewsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
  //   return this.reviewsService.update(+id, updateReviewDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.reviewsService.remove(+id);
  // }
}
