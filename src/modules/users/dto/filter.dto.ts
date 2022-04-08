import { AppRoles } from './../../roles/enums/roles.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { Helper } from '../../../shared/helpers';

export class UserFilterDto {
  @IsOptional()
  @IsEnum(AppRoles)
  @Transform(({ value }) => Helper.tranformValue(value))
  role?: AppRoles;
}
