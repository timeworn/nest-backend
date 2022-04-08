import { AppConstants } from '../../constants';
import axios from 'axios';

export class FlutterwaveService {
  baseUrl = AppConstants.FLUTTERWAVE_API_URL;
  apiKey = AppConstants.FLUTTERWAVE_API_KEY;
  request = axios.create({
    baseURL: this.baseUrl,
    headers: {
      Authorization: `Bearer ${this.apiKey}`,
    },
  });

  async findAllBanks() {
    const response = await this.request.get('banks/NG');
    return response.data;
  }
}
