import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepository } from 'typeorm';
import { User } from './modules/users/entities/user.entity';
import { Category } from './modules/categories/entities/category.entity';
import { Interest } from './modules/interests/entities/interest.entity';
import { Helper } from './shared/helpers';
import { ProductsService } from './modules/products/products.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventEmitter: EventEmitter2,
    private readonly productsService: ProductsService,
  ) {}

  // @Get()
  // handleInit() {
  //   this.eventEmitter.emit('app.init');
  // }

  @Post()
  async handleInit() {
    try {
      const users = await getRepository(User).find();
      const categories = await getRepository(Category).find();
      const interests = await getRepository(Interest).find();
      const total: number = 200;

      const products = [];

      const locations = [
        {
          lat: 6.5244,
          lng: 3.3792,
        },
        {
          lat: 6.5244,
          lng: 3.3792,
        },
        {
          lat: 6.5244,
          lng: 3.3792,
        },
        {
          lat: 6.5244,
          lng: 3.3792,
        },
        {
          lat: 6.5244,
          lng: 3.379,
        },
        {
          lat: 6.5244,
          lng: 3.3792,
        },
        {
          lat: 6.6018,
          lng: 3.3515,
        },
        {
          lat: 6.6252,
          lng: 3.3441,
        },
        {
          lat: 6.5873,
          lng: 3.3786,
        },
        {
          lat: 6.5095,
          lng: 3.3711,
        },
        {
          lat: 6.5157,
          lng: 3.3899,
        },
        {
          lat: 6.5178,
          lng: 3.3679,
        },

        {
          lat: 6.4646,
          lng: 3.5725,
        },

        {
          lat: 6.466,
          lng: 3.5446,
        },

        {
          lat: 6.4698,
          lng: 3.5852,
        },
      ];

      for (let index = 0; index < total; index++) {
        const product = {
          name: Helper.faker.commerce.productName(),
          currency: 'NGN',
          description: Helper.faker.lorem.paragraphs(),
          categoryIds: Helper.faker.random.arrayElements(categories, 4).map((x) => x.id),
          // lng: 3.383323303347627,
          // lat: 6.497872153156975,
          ...Helper.faker.random.arrayElement(locations),
          address: Helper.faker.address.streetAddress(),
          tagIds: Helper.faker.random.arrayElements(interests, 1).map((x) => x.id),
          amount: Number(Helper.faker.commerce.price()),
          images: [
            'https://placeimg.com/640/480',
            'https://placeimg.com/640/480',
            'https://placeimg.com/640/480',
          ],
          published: true,
        };

        this.productsService.create(product, Helper.faker.random.arrayElement(users));
      }
    } catch (error) {
      console.log({ error });
    }
  }

  // @Get()
  // handleInit() {
  //   return this.appService.handleStuff();
  // }
}
