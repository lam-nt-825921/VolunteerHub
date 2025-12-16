// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';

/**
 * Decorator để chỉ định vai trò (role) được phép truy cập route
 * Sử dụng cùng với RoleGuard
 * @Roles(Role.ADMIN, Role.VOLUNTEER, Role.EVENT_MANAGER)
 */
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);