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

/**
 * Guard JWT: Bảo vệ các route yêu cầu đăng nhập
 * Bỏ qua các route được đánh dấu @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Kiểm tra xem route có được đánh dấu là public không
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu là public, cho phép truy cập luôn
    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
  ) {
   
        

    if (user) {
      return user;
    }

    
    if (err || info) {
      throw err || new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }

    return user;
  }
}