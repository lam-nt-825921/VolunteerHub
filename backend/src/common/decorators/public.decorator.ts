// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**
 * Decorator để đánh dấu route là public, không yêu cầu xác thực JWT
 * Sử dụng cùng với JwtAuthGuard
 * @Public()
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);