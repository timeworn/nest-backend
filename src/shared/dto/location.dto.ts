import { IsNotEmpty } from 'class-validator';

export class LocationDto {
  @IsNotEmpty()
  lat: number;

  @IsNotEmpty()
  lng: number;
}
