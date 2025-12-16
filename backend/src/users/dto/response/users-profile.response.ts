// src/users/dto/users-profile.response.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../../generated/prisma/enums';

export class UserProfileDto {

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
  id: number;
 
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