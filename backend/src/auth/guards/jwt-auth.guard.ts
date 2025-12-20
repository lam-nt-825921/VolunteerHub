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
import { IS_AUTH_OPTIONAL_KEY } from '../../common/decorators/auth-optional.decorator';

const logger = new Logger('JwtAuthGuard');

/**
 * Guard JWT: Bảo vệ các route yêu cầu đăng nhập
 * Bỏ qua các route được đánh dấu @Public()
 * Với @AuthOptional(), vẫn parse token nếu có nhưng không throw error nếu không có
 * Refresh token được xử lý bởi RefreshTokenInterceptor
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

    // Kiểm tra xem route có được đánh dấu là auth optional không
    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(IS_AUTH_OPTIONAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu là public (không phải optional), cho phép truy cập luôn mà không parse token
    if (isPublic && !isAuthOptional) {
      logger.log('[JwtAuthGuard] Route is public, skipping authentication');
      return true;
    }

    // Nếu là auth optional, để OptionalJwtAuthGuard xử lý (không gọi ở đây)
    if (isAuthOptional) {
      logger.log('[JwtAuthGuard] Route is auth optional, deferring to OptionalJwtAuthGuard');
      return true;
    }

    logger.log('[JwtAuthGuard] Route requires authentication');
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