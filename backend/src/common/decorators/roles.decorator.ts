// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '../../generated/prisma/enums';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);