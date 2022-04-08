import axios, { AxiosResponse } from 'axios';
import { createHash, randomBytes } from 'crypto';
import { AppConstants } from '../../constants';
import { IBuildChecksum, IChecksum, IGetRequest, IPostRequest } from './thresh0ld.interface';

const baseUrl: string = AppConstants.THRESHOLD_BASE_URL;

export class Thresh0ldRequest {
  static buildChecksum({ params, data, secret }: IChecksum): IBuildChecksum {
    const result = [];
    const random = randomBytes(10).toString('hex');
    const millis = new Date().getTime();
    const time = Math.floor(millis / 1000);
    result.push(`r=${random}`);
    result.push(`t=${time}`);
    if (data) {
      result.push(JSON.stringify(data));
    }
    if (params) {
      result.push(JSON.stringify(params));
    }
    result.sort();
    result.push(`secret=${secret}`);
    return {
      checksum: createHash('sha256').update(result.join('&')).digest('hex'),
      random,
      time,
    };
  }

  static post({ walletSecret, walletCode, data, url }: IPostRequest): Promise<AxiosResponse> {
    const { checksum, random, time } = this.buildChecksum({
      data,
      secret: walletSecret,
    });
    const options = {
      headers: { 'X-CHECKSUM': checksum, 'X-API-CODE': walletCode },
    };
    url = `${baseUrl}${url}?t=${time}&r=${random}`;
    console.log({ url });
    return axios.post(url, data, options);
  }

  static get({ url, walletCode, walletSecret }: IGetRequest): Promise<AxiosResponse> {
    url = `${baseUrl}${url}`;
    const checksum = this.buildChecksum({ secret: walletSecret });
    const options = {
      headers: { 'X-CHECKSUM': checksum, 'X-API-CODE': walletCode },
    };
    return axios.get(url, options);
  }
}
