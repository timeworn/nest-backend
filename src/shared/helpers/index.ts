import slugify from 'slugify';
import * as faker from 'faker';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { FindConditions, FindManyOptions, getRepository } from 'typeorm';
import * as tokenGen from 'otp-generator';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';
import { RedisCacheService } from '../../modules/redis-cache/redis-cache.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AppConstants } from '../../constants';
import axios from 'axios';
import { decode, encode } from 'uuid-base58';
import * as randomString from 'randomstring';

class SlugifyOptions {
  lower: boolean;
  replacement: string;
}

export class Helper {
  static faker = faker;
  static dayjs = dayjs;

  static hash(string: string) {
    return bcrypt.hashSync(string, 8);
  }

  static compare(org: string, existing: string) {
    return bcrypt.compare(org, existing);
  }

  static async verifyOTP(service: RedisCacheService, identifier: string, code: string) {
    const otp = await service.get(identifier);
    if (otp.data != code) {
      throw new UnauthorizedException('Invalid OTP');
    }
    await service.remove(identifier);
    return {};
  }

  static slugify(name: string, options?: SlugifyOptions | Record<string, any>) {
    if (options) {
      return slugify(name, options);
    }
    return slugify(name, { lower: true, replacement: '_' });
  }

  static generateString(length: number) {
    var result: string = '';
    var characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static numberWithCommas(x: number | string): string {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  static async paginateItems(
    repository: any,
    options: IPaginationOptions,
    searchOptions: any = {},
    // searchOptions: FindConditions<unknown> | FindManyOptions<unknown> = {},
  ): Promise<Record<string, any>> {
    const response = await paginate(repository, options, searchOptions);

    const pagination = {
      page: Number(response.meta.currentPage),
      pageCount: Number(response.meta.totalPages),
      perPage: Number(response.meta.itemsPerPage),
      total: Number(response.meta.totalItems),
      nextPage: response.meta.currentPage < response.meta.totalPages,
      skipped: Number(response.meta.itemsPerPage * (response.meta.currentPage - 1)),
    };

    return {
      data: response.items,
      pagination,
    };
  }

  static generateToken(length: number = 6, options: Record<string, any> = {}) {
    return tokenGen.generate(length, {
      upperCase: false,
      specialChars: false,
      alphabets: false,
      digits: true,
      ...options,
    });
  }

  static async resolveRelationships(payload: any[], entity: any, key = 'id'): Promise<any[]> {
    const data = [];
    for (const value of payload) {
      const where = {};
      where[key] = value;
      const item = await getRepository(entity).findOne({ where: where });
      if (item) {
        data.push(item);
      }
    }
    // console.log(data);
    return data;
  }

  static tranformValue(value: string) {
    if (!value) return null;
    if (value == '') return null;
    return value;
  }

  static getCurrencyValue(currency: string) {
    return axios({
      url: `https://min-api.cryptocompare.com/data/price?fsym=${currency}&tsyms=USD`,
      headers: {
        Authorization: `Apikey ${AppConstants.CRYPTO_COMPARE_API_KEY}`,
      },
    });
  }

  static async currencyRates() {
    try {
      const response = await axios.get(
        AppConstants.FIXER_URL + 'latest?access_key=' + AppConstants.FIXER_API_KEY + '&base=' + AppConstants.FIXER_BASE_CURRENCY,
      );

      if (!response.data.success) throw new BadRequestException('An error occurred ');
      const rates = response.data.rates;

      console.log(response.data);
      console.log(rates);

      return rates;
    } catch (error) {
      return { NGN: 500 };
    } finally {
      console.log('updating currency rates');
    }
    // await this.redisCacheService.set('currency_exchange_rates', data);
  }

  static encodeId(prefix: string, id: string) {
    return `${prefix}_${encode(id)}`;
  }

  static decodeId(id: string) {
    const arr = id.split('_');
    return decode(arr[arr.length - 1]);
  }

  static randomNumber(length: number) {
    return randomString.generate({
      length: length,
      charset: 'numeric',
    });
  }

  static string(options: Record<string, any> | number) {
    return randomString.generate(options);
  }
}

export const log = (message: string) => console.log(message);
