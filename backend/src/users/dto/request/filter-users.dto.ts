// src/users/dto/request/filter-users.dto.ts
import { IsOptional, IsInt, Min, IsEnum, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../../generated/prisma/enums';

export class FilterUsersDto {
  @ApiProperty({
    example: 'nguyen',
    description: 'Tìm kiếm theo email hoặc fullName',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    example: Role.VOLUNTEER,
    description: 'Lọc theo vai trò',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiProperty({
    example: true,
    description: 'Lọc theo trạng thái kích hoạt',
    type: 'boolean',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 1,
    description: 'Số trang',
    type: 'integer',
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value) || 1)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiProperty({
    example: 20,
    description: 'Số lượng kết quả mỗi trang',
    type: 'integer',
    default: 20,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value) || 20)
  @IsInt()
  @Min(1)
  limit = 20;
}

