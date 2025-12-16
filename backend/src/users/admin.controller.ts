// backend/src/admin/admin.controller.ts
import { Controller, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RoleGuard } from '../auth/guards/roles.guard'; // Guard bạn đã tạo
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UsersService } from './users.service';

@Controller('admin/')
@UseGuards(RoleGuard) // Bảo vệ 2 lớp
@Roles(Role.ADMIN) // Chỉ ADMIN mới được sờ vào Controller này
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  // 1. Admin tạo trực tiếp Manager (Phương án A)
  @Post()
  async createManager(@Body() dto: CreateUserDto) {
    // DTO này có thể có field role, vì chỉ Admin dùng
    return this.usersService.createManager(dto);
  }

  // 2. Thăng chức cho Volunteer lên Manager (Phương án C)
  @Patch(':id/role')
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: Role // Body gửi lên: { "role": "EVENT_MANAGER" }
  ) {
    return this.usersService.updateRole(id, role);
  }
}