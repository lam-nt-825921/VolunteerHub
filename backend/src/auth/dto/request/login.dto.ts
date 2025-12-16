// src/auth/dto/request/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

/**
 * DTO để yêu cầu đăng nhập
 */
export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  password: string;
}