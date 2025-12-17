// src/users/dto/request/update-user.dto.ts
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Nguyễn Văn D',
    description: 'Họ và tên',
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
    example: '0901234567',
    description: 'Số điện thoại',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: Role.EVENT_MANAGER,
    description: 'Vai trò người dùng',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    example: true,
    description: 'Trạng thái kích hoạt tài khoản',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

