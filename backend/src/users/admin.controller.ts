// backend/src/users/admin.controller.ts
import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  ParseIntPipe,
  Get,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { RoleGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../generated/prisma/enums';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { FilterUsersDto } from './dto/request/filter-users.dto';
import { UsersService } from './users.service';

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(RoleGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Lấy danh sách tất cả users (có filter và pagination)
   * GET /admin/users
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách users (có filter và pagination)',
    schema: {
      example: {
        data: [
          {
            id: 1,
            email: 'user1@example.com',
            fullName: 'Nguyễn Văn A',
            role: 'VOLUNTEER',
            isActive: true,
            createdAt: '2025-01-01T10:00:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 100,
        },
      },
    },
  })
  async findAll(@Query() filter: FilterUsersDto) {
    return this.usersService.findAll(filter);
  }

  /**
   * Lấy chi tiết 1 user
   * GET /admin/users/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết user theo ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Thông tin user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * Tạo user mới (Admin có thể tạo bất kỳ role nào)
   * POST /admin/users
   */
  @Post()
  @ApiOperation({ summary: 'Tạo user mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'User đã được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Email đã tồn tại' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createManager(dto);
  }

  /**
   * Cập nhật thông tin user
   * PATCH /admin/users/:id
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin user (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto);
  }

  /**
   * Thay đổi role của user
   * PATCH /admin/users/:id/role
   */
  @Patch(':id/role')
  @ApiOperation({ summary: 'Thay đổi role của user (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          enum: Object.values(Role),
          example: Role.EVENT_MANAGER,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Role đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changeRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: Role,
  ) {
    return this.usersService.updateRole(id, role);
  }

  /**
   * Kích hoạt/vô hiệu hóa user
   * PATCH /admin/users/:id/activate
   */
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Kích hoạt/vô hiệu hóa user (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Trạng thái đã được cập nhật' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.usersService.toggleActive(id, isActive);
  }

  /**
   * Xóa user (soft delete - set isActive = false)
   * DELETE /admin/users/:id
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user (vô hiệu hóa tài khoản) (Admin only)' })
  @ApiResponse({ status: 200, description: 'User đã được vô hiệu hóa' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }
}