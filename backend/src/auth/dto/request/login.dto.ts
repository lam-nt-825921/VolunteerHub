// src/auth/dto/request/login.dto.ts
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO để yêu cầu đăng nhập
 */
export class LoginDto {
  @ApiProperty({
    example: 'admin@volunteerhub.com',
    description: 'Email đăng nhập',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mật khẩu',
    minLength: 6,
  })
  @IsString()
  password: string;
}