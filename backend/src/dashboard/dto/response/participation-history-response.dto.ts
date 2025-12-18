// src/dashboard/dto/response/participation-history-response.dto.ts
import { Expose, Type } from 'class-transformer';
import { EventStatus, EventVisibility, RegistrationStatus } from '../../../generated/prisma/enums';

/**
 * Thông tin event trong lịch sử tham gia
 */
export class ParticipationEventSummaryDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  location: string;

  @Expose()
  coverImage: string | null;

  @Expose()
  startTime: Date;

  @Expose()
  endTime: Date;

  @Expose()
  status: EventStatus;

  @Expose()
  visibility: EventVisibility;
}

/**
 * DTO cho 1 bản ghi lịch sử tham gia
 */
export class ParticipationHistoryItemDto {
  @Expose()
  registrationId: number;

  @Expose()
  status: RegistrationStatus;

  @Expose()
  registeredAt: Date;

  @Expose()
  attendedAt: Date | null;

  @Expose()
  @Type(() => ParticipationEventSummaryDto)
  event: ParticipationEventSummaryDto;
}


