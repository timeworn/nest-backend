import { SetMetadata } from '@nestjs/common';

export const UseAppRoles = (...roles: string[]) => SetMetadata('roles', roles);
