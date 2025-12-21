import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/enums';

export const ROLES_KEY = 'roles';

/**
 * Guard Role: Bảo vệ các route yêu cầu vai trò cụ thể sau khi đã đăng nhập
 * Kiểm tra vai trò của user đã xác thực (từ JwtAuthGuard)
 */
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Kiểm tra quyền truy cập route dựa trên vai trò người dùng
   * @param context - Execution context
   * @returns true nếu người dùng có vai trò phù hợp
   * @throws ForbiddenException nếu người dùng chưa đăng nhập hoặc không có vai trò phù hợp
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Vui lòng đăng nhập');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    return true;
  }
}