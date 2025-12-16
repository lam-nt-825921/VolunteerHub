// src/users/dto/update-profile.dto.ts
import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';


/**
 * DTO để cập nhật thông tin cá nhân người dùng
 * Database Table: User
 * id: number | null (không được sửa)
   email: string | null (không được sửa)
   password: string | null 
   fullName: string | null
   avatar: string | null
   phone: string | null
   role: $Enums.Role | null (sửa ở chức năng phân quyền)
   isActive: boolean | null (không được sửa)
   createdAt: Date | null (không được sửa)
   updatedAt: Date | null (không được sửa)
   refreshToken: string | null (ẩn, không sửa)
   refreshTokenExpiresAt: Date | null (ẩn, không sửa)
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}