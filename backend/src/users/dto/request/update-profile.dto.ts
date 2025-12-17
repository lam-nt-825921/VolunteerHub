// src/users/dto/update-profile.dto.ts
import { IsOptional, IsString, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


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
  @ApiProperty({
    example: 'Nguyễn Văn B',
    description: 'Họ và tên mới',
    required: false,
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/example/avatar.jpg',
    description: 'URL ảnh đại diện',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Mật khẩu mới',
    required: false,
  })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    example: '0901234567',
    description: 'Số điện thoại',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;
}