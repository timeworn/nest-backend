import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Match } from '../../shared/decorators/match.decorator';
import { Helper } from '../../shared/helpers';

export class LoginDto {
  // @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @IsNotEmpty()
  identifier: string;

  @IsNotEmpty()
  password: string;
}

export class RegisterAccountDto {
  @ApiProperty({ example: Helper.faker.name.firstName() })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: Helper.faker.name.lastName() })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: Helper.faker.internet.userName() })
  @Transform(({ value }) => value.toLowerCase())
  @MinLength(4)
  // @Matches(`^(?=.*\w)[\w]{4,15}$`)
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: Helper.faker.internet.email() })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ example: Helper.faker.phone.phoneNumber() })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ example: Helper.faker.phone.phoneFormats() })
  @IsOptional()
  countryCode?: string;

  @ApiProperty({ example: Helper.faker.address.country() })
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: Helper.faker.address.country() })
  @IsNotEmpty()
  dialCode: string;

  @ApiProperty({ example: Helper.faker.internet.password() })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'cbe9a461-8369-453e-a5be-29c403b03ed0' })
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ example: Helper.faker.image.imageUrl() })
  @IsOptional()
  avatar: string;

  @ApiProperty({ example: Helper.faker.random.alphaNumeric(6) })
  @IsOptional()
  referralCode: string;
}

export interface AuthPayload {
  id: string;
}

export class ForgotPasswordDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  identifier: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}

export class GenerateOTPDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  identifier: string;
}

export class VerifyOTPDto {
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  identifier: string;

  @IsNotEmpty()
  code: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  oldPassword: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  @Match('password')
  confirmPassword: string;
}
