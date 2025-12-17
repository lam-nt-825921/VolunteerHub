// src/auth/dto/request/refresh-token.dto.ts
import { IsString } from 'class-validator';

/**
 * DTO để yêu cầu làm mới token
 */
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}