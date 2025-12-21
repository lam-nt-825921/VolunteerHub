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

  /**
   * Kiểm tra quyền truy cập route
   * Bỏ qua authentication cho các route được đánh dấu @Public()
   * Để OptionalJwtAuthGuard xử lý các route được đánh dấu @AuthOptional()
   * @param context - Execution context
   * @returns true nếu route là public/optional, hoặc kết quả từ super.canActivate() nếu cần authentication
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(IS_AUTH_OPTIONAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic && !isAuthOptional) {
      return true;
    }

    if (isAuthOptional) {
      return true;
    }

    return super.canActivate(context);
  }

  /**
   * Xử lý kết quả xác thực từ Passport
   * @param err - Lỗi xác thực (nếu có)
   * @param user - Thông tin người dùng (nếu xác thực thành công)
   * @param info - Thông tin bổ sung về xác thực
   * @returns Thông tin người dùng nếu hợp lệ
   * @throws UnauthorizedException nếu xác thực thất bại
   */
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