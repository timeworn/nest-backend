import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';

export class AbstractResponse {
  @ApiResponseProperty()
  status: boolean;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  data: any;
}

export class PaginatedResponse<TData> {
  @ApiProperty()
  data: TData[];

  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  pageCount: number;

  @ApiResponseProperty()
  perPage: number;

  @ApiResponseProperty()
  total: number;

  @ApiResponseProperty()
  skipped: number;
}
