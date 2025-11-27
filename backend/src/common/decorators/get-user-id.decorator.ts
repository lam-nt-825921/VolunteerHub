// src/common/decorators/get-user-id.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.id; // request.user được JwtStrategy gán vào
  },
);