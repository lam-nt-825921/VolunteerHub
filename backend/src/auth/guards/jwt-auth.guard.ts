// src/auth/guards/jwt-auth.guard.ts
import {
    Logger,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const logger = new Logger('JwtAuthGuard');
    logger.log('Checking if route is public');
    // Kiểm tra có @Public() không → nếu có thì bỏ qua JWT
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    logger.log(`Is route public? ${isPublic}`);
    if (isPublic) {
      return true;
    }

    // Nếu không public → kiểm tra JWT bình thường
    Logger.log('Route is protected, validating JWT');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
    return user;
  }
}