// src/auth/dto/request/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums';

/**
 * DTO để đăng ký người dùng mới
 */
export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email đăng ký',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên',
    required: false,
  })
  @IsString()
  @IsOptional()
  fullName?: string;


}