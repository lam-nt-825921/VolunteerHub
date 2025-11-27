import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/enums';

export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  // Chỉ admin mới được tạo event_manager hoặc admin
  // Thông thường người dùng tự đăng ký → mặc định là volunteer
  @IsOptional()
  @IsEnum(Role, { message: 'Role không hợp lệ' })
  role?: Role;
}