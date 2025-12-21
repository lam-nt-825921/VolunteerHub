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
  /**
   * Kiểm tra quyền truy cập route với authentication tùy chọn
   * Nếu có token hợp lệ thì xác thực user, nếu không thì vẫn cho phép truy cập với user = null
   * @param context - Execution context
   * @returns true (luôn cho phép truy cập, nhưng user có thể là null)
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    try {
      const result = await super.canActivate(context);
      return result as boolean;
    } catch (error) {
      request.user = null;
      return true;
    }
  }

  /**
   * Xử lý kết quả xác thực từ Passport (tùy chọn)
   * Trả về user nếu hợp lệ, hoặc null nếu không có token/token không hợp lệ
   * @param err - Lỗi xác thực (nếu có)
   * @param user - Thông tin người dùng (nếu xác thực thành công)
   * @param info - Thông tin bổ sung về xác thực
   * @returns Thông tin người dùng nếu hợp lệ, hoặc null
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      return null;
    }
    return user;
  }
}