// src/users/dto/users-profile.response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../../generated/prisma/enums';

export class UserProfileDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  fullName: string | null;

  @Expose()
  role: Role;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt?: Date;

  @Expose()
  updatedAt?: Date;

  @Expose()
  avatar?: string | null;

  @Expose()
  phone?: string | null;

  @Expose()
  reputationScore?: number;

  // Các field nhạy cảm sẽ tự động bị exclude
  @Exclude()
  password?: string;

  @Exclude()
  refreshToken?: string;

  @Exclude()
  refreshTokenExpiresAt?: Date;
}



export class AuthResponseDto {
  user: UserProfileDto;
  accessToken: string;
  expiresIn: number;
}