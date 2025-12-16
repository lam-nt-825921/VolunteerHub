// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator để lấy thông tin user hiện tại từ request
 * Sử dụng sau khi đã qua JwtAuthGuard
 * @CurrentUser() => trả về toàn bộ user
 * @CurrentUser('id') => trả về user.id
 */
export const CurrentUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);