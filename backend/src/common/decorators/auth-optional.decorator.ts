// src/common/decorators/auth-optional.decorator.ts
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';

export const IS_AUTH_OPTIONAL_KEY = 'isAuthOptional';

/**
 * Decorator để đánh dấu route là optional auth:
 * - Nếu có token hợp lệ thì parse và set user
 * - Nếu không có token hoặc token không hợp lệ thì vẫn cho phép truy cập (user = null)
 */
export function AuthOptional() {
  return applyDecorators(
    SetMetadata(IS_AUTH_OPTIONAL_KEY, true), // Đánh dấu là optional auth
    UseGuards(OptionalJwtAuthGuard) // Kích hoạt Guard Optional
  );
}