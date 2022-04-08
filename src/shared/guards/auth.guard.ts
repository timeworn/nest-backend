import { AuthGuard as NestGuard } from '@nestjs/passport';

export const AuthGuard = NestGuard('jwt');
