import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { resolveResponse } from '../../shared/resolvers';
import { Query } from '@nestjs/common';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { FilterProductsDto } from './dto/filter-products.dto';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { ApiPaginatedResponse } from '../../shared/decorators/paginated.decorator';
import { Product } from './entities/product.entity';
import { PaginatedResponse } from '../../shared/abstract.response';
import { CreateReviewDto } from '../reviews/dto/create-review.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: User) {
    return resolveResponse(this.productsService.create(createProductDto, user));
  }

  // @ApiPaginatedResponse(Product)
  // @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() pagination: AbstractPaginationDto, @Query() filterProductsDto: FilterProductsDto, @CurrentUser() user: User): Promise<Product> {
    // ): Promise<PaginatedResponse<Product>> {
    return resolveResponse(this.productsService.findAll(pagination, filterProductsDto));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('user/my-products')
  findAllUser(@Query() pagination: AbstractPaginationDto, @Query('type') type: string = 'all', @CurrentUser() user: User): Promise<Product> {
    // ): Promise<PaginatedResponse<Product>> {
    return resolveResponse(this.productsService.findAllUser(pagination, user, type));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return resolveResponse(this.productsService.findOne(id));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return resolveResponse(this.productsService.update(id, updateProductDto));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('bulk-publish')
  bulkPublish(@Body('productIds') productIds: string[], @CurrentUser() user: User) {
    return resolveResponse(this.productsService.bulkPublish(productIds, user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('bulk-unpublish')
  bulkUnPublish(@Body('productIds') productIds: string[], @CurrentUser() user: User) {
    return resolveResponse(this.productsService.bulkUnPublish(productIds, user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.productsService.publish(id, user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id/unpublish')
  unPublish(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.productsService.unPublish(id, user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id/save')
  save(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.productsService.save(id, user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id/unsave')
  unsave(@Param('id') id: string, @CurrentUser() user: User) {
    return resolveResponse(this.productsService.unsave(id, user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('user/saved-products')
  fetchSaved(@CurrentUser() user: User) {
    return resolveResponse(this.productsService.fetchSaved(user));
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard)
  // @Patch(':id/review')
  // reviewProduct(@Param('id') id: string, @Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
  //   return resolveResponse(this.productsService.reviewProduct(id, { ...createReviewDto, userId: user.id }));
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id/reviews')
  fetchReviews(@Param('id') id: string) {
    return resolveResponse(this.productsService.fetchReviews(id));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return resolveResponse(this.productsService.remove(id));
  }
}
