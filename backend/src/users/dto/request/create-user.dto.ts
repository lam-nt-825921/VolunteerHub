// src/users/dto/request/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @ApiProperty({
    example: 'manager@example.com',
    description: 'Email người dùng',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Nguyễn Văn C',
    description: 'Họ và tên',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: Role.EVENT_MANAGER,
    description: 'Vai trò người dùng',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Role không hợp lệ' })
  role?: Role;

}