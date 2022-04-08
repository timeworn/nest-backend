import { ApiProperty } from '@nestjs/swagger';
import { paginate, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FindConditions, FindManyOptions } from 'typeorm';

export function sendObjectResponse(data: any, message: string) {
  return {
    status: true,
    message,
    data,
  };
}

export function sendPaginatedListResponse(response: any, message: string) {
  return {
    status: true,
    message,
    ...response,
  };
}

export function sendListResponse(data: any[], message: string) {
  return {
    status: true,
    message,
    data,
  };
}

// export async function PaginateItems(
//   repository: any,
//   options: IPaginationOptions,
//   searchOptions: FindConditions<unknown> | FindManyOptions<unknown> = {},
// ) {
//   const response = await paginate(repository, options, searchOptions);

//   const pagination = {
//     page: Number(response.meta.currentPage),
//     pageCount: Number(response.meta.totalPages),
//     perPage: Number(response.meta.itemsPerPage),
//     total: Number(response.meta.totalItems),
//     skipped: Number(
//       response.meta.itemsPerPage * (response.meta.currentPage - 1),
//     ),
//   };

//   return {
//     data: response.items,
//     pagination,
//   };
// }
