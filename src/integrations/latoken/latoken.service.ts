import { Injectable } from '@nestjs/common';
import { AppConstants } from '../../constants';
import axios from 'axios';
import { LatokenTickerModel } from './models/latoken-ticker.model';

const baseUrl = AppConstants.LATOKEN_API_URL;
const apiKey = AppConstants.LATOKEN_PUBLIC_KEY;

const http = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-LA-APIKEY': apiKey,
  },
});

@Injectable()
export class LatokenService {
  async getTickerPair(baseCurrency: string, quoteCurrency: string): Promise<LatokenTickerModel> {
    const response = await http.get(`ticker/${baseCurrency}/${quoteCurrency}`);
    return response.data;
  }
}
