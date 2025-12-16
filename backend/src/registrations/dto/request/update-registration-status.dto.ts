// src/registrations/dto/request/update-registration-status.dto.ts
import { IsEnum } from 'class-validator';
import { RegistrationStatus } from '../../../generated/prisma/enums';

export class UpdateRegistrationStatusDto {
  @IsEnum(RegistrationStatus)
  status: RegistrationStatus;
}

