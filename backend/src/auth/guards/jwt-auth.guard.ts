import {
  Logger,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import {
  ALLOW_GUEST_KEY,
} from '../../common/decorators/allow-guest.decorator';
import { Role } from '../../generated/prisma/enums';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('JwtAuthGuard');
    logger.log('Checking if route is public');
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    logger.log(`Is route public? ${isPublic}`);
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ) {
    const allowGuest = this.reflector.getAllAndOverride<boolean>(
      ALLOW_GUEST_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (user) {
      return user;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const hasAuthHeader = Boolean(request.headers?.authorization);

    if (allowGuest && !hasAuthHeader) {
      const guest = { id: null, role: Role.GUEST };
      request.user = guest;
      return guest;
    }

    if (err || info) {
      throw err || new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    return user;
  }
}
// src/auth/guards/jwt-auth.guard.ts