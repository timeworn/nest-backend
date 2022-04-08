import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { resolveResponse } from '../../shared/resolvers';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return resolveResponse(this.categoriesService.create(createCategoryDto));
  }

  @ApiQuery({
    required: false,
    name: 'isSubcategory',
  })
  @Get()
  findAll(@Query() pagination: AbstractPaginationDto, @Query('isSubcategory') isSubcategory: boolean) {
    let response;
    if (isSubcategory == true || isSubcategory == false) {
      response = this.categoriesService.findAll(pagination, { isSubcategory });
    } else {
      response = this.categoriesService.findAll(pagination);
    }
    return resolveResponse(response);
  }

  @Get('/list/get')
  list() {
    return resolveResponse(this.categoriesService.list());
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.categoriesService.findOne(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return resolveResponse(this.categoriesService.update(id, updateCategoryDto));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.categoriesService.remove(id));
  }
}
