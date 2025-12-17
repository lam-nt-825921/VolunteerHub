// src/auth/guards/optional-jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT tùy chọn: Nếu có token hợp lệ thì xác thực user,
 * nếu không có token thì vẫn cho phép truy cập (user = undefined)
 * dùng cho các route không bắt buộc đăng nhập nhưng có sự khác biệt giữa đã hoặc chưa đăng nhập
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    // Dù có lỗi (không token) hay không có user, vẫn cho qua
    // Controller sẽ tự kiểm tra if (user) { ... } else { ... }

    return user; 
  }
}