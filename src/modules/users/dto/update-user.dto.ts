import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Helper } from '../../../shared/helpers';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto {
  @ApiProperty({ example: Helper.faker.name.firstName() })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: Helper.faker.name.lastName() })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: Helper.faker.internet.userName() })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: Helper.faker.internet.email() })
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: Helper.faker.phone.phoneNumber() })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ example: Helper.faker.image.imageUrl() })
  @IsNotEmpty()
  avatar: string;

  @ApiProperty({ example: Helper.faker.lorem.paragraphs() })
  @IsOptional()
  bio: string;
}
