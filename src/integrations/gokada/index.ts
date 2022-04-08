import axios from 'axios';
import { AppConstants } from '../../constants';
import {
  CancelGokadaOrderDto,
  CreateGokadaOrderDto,
  CreateGokadaOrderResponse,
  EstimateGokadaOrderDto,
  EstimateGokadaOrderResponse,
} from './gokada.interface';

const http = axios.create({
  baseURL: AppConstants.GOKADA_API_URL,
});

const api_key = AppConstants.GOKADA_API_KEY;

export class GokadaService {
  async createOrder(createGokadaOrderDto: CreateGokadaOrderDto) {
    const response = await http.post('order_estimate', {
      ...createGokadaOrderDto,
      api_key,
    });
    return response.data as CreateGokadaOrderResponse;
  }

  async cancelOrder(cancelGokadaOrderDto: CancelGokadaOrderDto) {
    const response = await http.post('order_cancel', {
      ...cancelGokadaOrderDto,
      api_key,
    });
    return response.data;
  }

  async getEstimate(estimateGokadaOrderDto: EstimateGokadaOrderDto) {
    const response = await http.post('v2/order_estimate', {
      ...estimateGokadaOrderDto,
      api_key,
    });

    return response.data as EstimateGokadaOrderResponse;
  }
}
