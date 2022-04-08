import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsOptional()
  telephone: string;

  @ApiHideProperty()
  password: string;
}

export enum PreferredCommunication {
  WHATSAPP = 'WhatsApp',
  SMS = 'SMS',
  EMAIL = 'Email',
}