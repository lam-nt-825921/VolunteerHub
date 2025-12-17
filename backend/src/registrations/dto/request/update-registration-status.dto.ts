// src/registrations/dto/request/update-registration-status.dto.ts
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RegistrationStatus } from '../../../generated/prisma/enums';

export class UpdateRegistrationStatusDto {
  @ApiProperty({
    example: RegistrationStatus.APPROVED,
    description: 'Trạng thái đăng ký mới',
    enum: RegistrationStatus,
  })
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;
}

