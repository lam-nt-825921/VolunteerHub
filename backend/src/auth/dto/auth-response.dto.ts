// src/auth/dto/auth-response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../generated/prisma/enums';

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
  avatarUrl?: string | null;

  // Các field nhạy cảm sẽ tự động bị exclude
  @Exclude()
  password?: string;

  @Exclude()
  refreshToken?: string;

}



export class AuthResponseDto {
  user: UserProfileDto;
  accessToken: string;
  expiresIn: number;
}