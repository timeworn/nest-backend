// import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Helper } from '../../../shared/helpers';
// import { CreateSettingDto } from './create-setting.dto';

export class UpdateSettingDto {
  @ApiProperty({ required: false, example: 'NGN' })
  @IsOptional()
  currency: string;

  @ApiProperty({ required: false, example: Helper.faker.datatype.boolean() })
  @IsOptional()
  pushNotifications: boolean;

  @ApiProperty({ required: false, example: Helper.faker.datatype.boolean() })
  @IsOptional()
  emailNotifications: boolean;

  @ApiProperty({ required: false, example: Helper.faker.datatype.boolean() })
  @IsOptional()
  sounds: boolean;

  // @IsOptional()
  // interests: boolean;

  // @ManyToMany(() => Category, (category) => category.settings, { eager: true })
  // subscribedCategories: Category[];

  @ApiProperty({ required: false, example: Helper.faker.datatype.boolean() })
  @IsOptional()
  hideAmount: boolean;

  // @IsOptional()
  // transactionPin: boolean;

  @ApiProperty({ required: false, example: Helper.faker.datatype.boolean() })
  @IsOptional()
  allowBiometrics: boolean;
}
