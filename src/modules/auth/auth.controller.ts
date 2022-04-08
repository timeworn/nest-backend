import { Controller, Get, Post, Body, UseGuards, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { getRepository } from 'typeorm';
import { CurrentUser } from '../../shared/decorators/user.decorator';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { resolveResponse } from '../../shared/resolvers';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { ChangePasswordDto, ForgotPasswordDto, GenerateOTPDto, LoginDto, RegisterAccountDto, ResetPasswordDto, VerifyOTPDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async login(@Body() loginAccountDto: LoginDto) {
    return resolveResponse(this.authService.login(loginAccountDto), 'Login Success');
  }

  @Post('sign-up')
  async register(@Body() registerAccountDto: RegisterAccountDto) {
    return resolveResponse(this.authService.register(registerAccountDto), 'Account Created');
  }

  // @Post('sign-in')
  // async login(@Body() loginDto: LoginDto) {
  //   return resolveResponse(this.authService.login(loginDto), 'Login Success');
  // }
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('me')
  async validateToken(@CurrentUser() user: User) {
    const products = await getRepository(Product).find({
      where: { userId: user.id, published: true },
      take: 5,
      relations: [],
      order: { createdAt: 'DESC' },
    });

    return resolveResponse({ ...user, products }, 'Token is valid');
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { identifier }: ForgotPasswordDto) {
    return resolveResponse(this.authService.forgotPassword(identifier));
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return resolveResponse(this.authService.resetPassword(resetPasswordDto));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @CurrentUser() user: User) {
    return resolveResponse(this.authService.changePassword(changePasswordDto, user));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('verify-password')
  async verifyPassword(@Body('password') password: string, @CurrentUser() user: User) {
    return resolveResponse(this.authService.verifyPassword(password, user));
  }

  @Post('generate-otp')
  async generateOTP(@Body() generateOTPDto: GenerateOTPDto) {
    return resolveResponse(this.authService.generateOTP(generateOTPDto));
  }

  @Post('verify-otp')
  async verifyOTP(@Body() verifyOTPDto: VerifyOTPDto) {
    return resolveResponse(this.authService.verifyOTP(verifyOTPDto));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch('update-notification-token/:fcmToken')
  updateNotificationToken(@Param('fcmToken') fcmToken: string, @CurrentUser() user: User) {
    console.log('updating fcm token');
    return resolveResponse(this.authService.updateNotificationToken(fcmToken, user));
  }
}
