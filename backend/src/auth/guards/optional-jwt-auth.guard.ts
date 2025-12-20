// src/auth/guards/optional-jwt-auth.guard.ts
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const logger = new Logger('OptionalJwtAuthGuard');

/**
 * Guard JWT tùy chọn: Nếu có token hợp lệ thì xác thực user,
 * nếu không có token thì vẫn cho phép truy cập (user = undefined)
 * dùng cho các route không bắt buộc đăng nhập nhưng có sự khác biệt giữa đã hoặc chưa đăng nhập
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization;
    
    logger.log(`OptionalJwtAuthGuard: checking auth header: ${authHeader ? 'present' : 'missing'}`);
    
    try {
      // Cố gắng xác thực token nếu có
      const result = await super.canActivate(context);
      logger.log(`OptionalJwtAuthGuard: token validation result: ${result ? 'success' : 'failed'}`);
      return result as boolean;
    } catch (error) {
      // Nếu không có token hoặc token không hợp lệ, vẫn cho phép truy cập
      logger.log(`OptionalJwtAuthGuard: token validation error: ${error.message}, allowing access with user=null`);
      request.user = null;
      return true;
    }
  }

  handleRequest(err: any, user: any, info: any) {
    logger.log(`OptionalJwtAuthGuard handleRequest: err=${err ? err.message : 'none'}, user=${user ? `id=${user.id}` : 'null'}, info=${info ? info.message : 'none'}`);
    
    // Nếu có lỗi (không token hoặc token không hợp lệ), vẫn cho qua với user = null
    // Nếu có user hợp lệ, trả về user
    // Controller sẽ tự kiểm tra if (user) { ... } else { ... }
    if (err || !user) {
      return null;
    }
    return user;
  }
}