// src/common/decorators/auth-optional.decorator.ts
import { applyDecorators, UseGuards } from '@nestjs/common';
import { Public } from './public.decorator'; // Decorator Public bạn đã có
import { OptionalJwtAuthGuard } from '../../auth/guards/optional-jwt-auth.guard';

export function AuthOptional() {
  return applyDecorators(
    Public(), // 1. Báo cho Global Guard biết để bỏ qua
    UseGuards(OptionalJwtAuthGuard) // 2. Kích hoạt Guard Optional chạy cục bộ
  );
}