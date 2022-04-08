import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getRepository, Repository } from 'typeorm';
import { AbstractPaginationDto } from '../dto/abstract-pagination.dto';
import { Helper } from '../helpers';

export class AbstractService<T> {
  repository: any;
  modelName: string;
  fields: any[] = [];

  async create(payload: any, ...args: any): Promise<T> {
    const data = this.repository.create(payload);
    const entity = await this.repository.save(data);
    return this.findOne(entity.id);
  }

  findAll(pagination: AbstractPaginationDto, ...args: any) {
    // console.log(...args);
    return Helper.paginateItems(this.repository, pagination, {
      where: args,
    });
  }

  list(...args: any): Promise<T[]> {
    return this.repository.find({ where: args });
  }

  // async findOne(id: string, ...args: any): Promise<T> {
  //   const response = await this.repository.findOne(id);

  //   if (!response) {
  //     throw new NotFoundException(`${this.modelName} Not Found`);
  //   }

  //   return response;
  // }

  async findOne(value: string, key: string = 'id', ...args: any): Promise<T> {
    const condition = {};
    condition[key] = value;
    const response = await this.repository.findOne({ where: condition });

    if (!response) {
      throw new NotFoundException(`${this.modelName} Not Found`);
    }

    return response;
  }

  async findOneBySlug(slug: string): Promise<T> {
    const response = await this.repository.findOne({ where: { slug } });

    if (!response) {
      throw new NotFoundException(`${this.modelName} Not Found`);
    }

    return response;
  }

  async findOneByUser(id: string, userId: string): Promise<T> {
    const response = await this.repository.findOne({ where: { id, userId } });

    if (!response) {
      throw new NotFoundException(`${this.modelName} Not Found`);
    }

    return response;
  }

  async update(id: string, payload: any, ...args: any): Promise<T> {
    await this.findOne(id);
    await this.repository.update(id, payload);
    return this.findOne(id);
  }

  async remove(id: string, ...args: any): Promise<Record<string, any>> {
    await this.findOne(id);
    await this.repository.delete(id);
    return {};
  }

  async resolveRelationships(payload: any[], entity: any, key = 'id'): Promise<any[]> {
    return Helper.resolveRelationships(payload, entity, key);
  }
}
