import { ApiHideProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { User } from "../../users/entities/user.entity";
import { SearchRequestType } from "../enums/search-request.enum";

export class CreateSmartSearchDto {
  @IsNotEmpty()
  productName: string;

  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;

  @IsEnum(SearchRequestType)
  @IsNotEmpty()
  type: string;

  @ApiHideProperty()
  createdById: string;
}

export class JoinSearch {
  @IsNotEmpty()
  product: string;
}
