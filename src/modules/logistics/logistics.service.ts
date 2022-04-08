import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GokadaService } from '../../integrations/gokada';
import { AppCurrency } from '../../shared/enums/app-currency.enum';
import GlobalOperations from '../../shared/global';
import { Helper } from '../../shared/helpers';
import { AbstractService } from '../../shared/services/abstract-service.service';
import { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { CreateLogisticDto } from './dto/create-logistic.dto';
import { FetchFareDto } from './dto/fetch-fare.dto';
import { UpdateLogisticDto } from './dto/update-logistic.dto';
import { Logistic } from './entities/logistic.entity';

@Injectable()
export class LogisticsService extends AbstractService<Logistic> {
  constructor(
    @InjectRepository(Logistic) private readonly logisticsRepository: Repository<Logistic>,
    private readonly gokadaService: GokadaService,
    private readonly productsService: ProductsService,
  ) {
    super();
    this.repository = this.logisticsRepository;
    this.modelName = 'Logistic';
  }

  async fetchFareByLogistic(id: string, fetchFareDto: FetchFareDto) {
    const { productId } = fetchFareDto;

    let product: Product;

    if (productId) {
      product = await this.productsService.findOne(productId);
      fetchFareDto.pickupLatitude = product.lat;
      fetchFareDto.pickupLongitude = product.lng;
    }

    const { pickupLatitude, pickupLongitude, deliveryLatitude, deliveryLongitude } = fetchFareDto;

    const payload = {
      pickup_latitude: pickupLatitude,
      pickup_longitude: pickupLongitude,
      delivery_latitude: deliveryLatitude,
      delivery_longitude: deliveryLongitude,
    };

    const logistic = await this.findOne(id);

    const { slug } = logistic;

    let response;

    switch (slug) {
      case 'gokada':
        // response = await this.gokadaService.getEstimate(payload);
        response = {
          distance: 33,
          time: 44,
          fare: Helper.faker.datatype.number({ min: 3000, max: 9000 }),
        };
        break;
      default:
        break;
    }

    const fare = await GlobalOperations.convertCurrency({
      amount: response.fare,
      baseCurrency: AppCurrency.NAIRA,
      targetCurrency: product?.currency ?? AppCurrency.NAIRA,
    });

    return { ...response, fare };
  }

  async fetchFare(fetchFareDto: FetchFareDto) {
    const logistics = await this.list();
    const data = [];

    for (const logistic of logistics) {
      const estimate = await this.fetchFareByLogistic(logistic.id, fetchFareDto);
      // const estimate = {
      //   distance: 33,
      //   time: 44,
      //   fare: Helper.faker.datatype.number({ min: 3000, max: 9000 }),
      // };

      data.push({
        ...logistic,
        ...estimate,
      });
    }

    return data;
  }
}
