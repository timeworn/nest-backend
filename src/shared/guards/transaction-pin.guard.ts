import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import GlobalOperations from '../global';

@Injectable()
export class TransactionPinGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext,
  ):Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    await GlobalOperations.verifyTransactionPin(request.body, request.user);

    return true;
  }
}
