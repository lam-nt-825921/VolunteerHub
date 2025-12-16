// src/registrations/dto/response/registration-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { RegistrationStatus } from '../../../generated/prisma/enums';

/**
 * DTO cho thông tin user trong registration (nested)
 */
export class UserSummaryDto {
  @Expose()
  id: number;

  @Expose()
  fullName: string;

  @Expose()
  avatar: string | null;

  @Expose()
  reputationScore: number;
}

/**
 * DTO response cho Registration
 */
export class RegistrationResponseDto {
  @Expose()
  id: number;

  @Expose()
  status: RegistrationStatus;

  @Expose()
  permissions: number;

  @Expose()
  registeredAt: Date;

  @Expose()
  attendedAt: Date | null;

  @Expose()
  eventId: number;

  @Expose()
  @Type(() => UserSummaryDto)
  user: UserSummaryDto;
}

