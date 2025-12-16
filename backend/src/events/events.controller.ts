// src/events/events.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-status.dto';
import { FilterEventsDto } from './dto/filter-event.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import {CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/enums';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // PUBLIC: Ai cũng xem được (guest + user)
  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách sự kiện công khai' })
  @ApiResponse({ status: 200, description: 'Danh sách sự kiện công khai' })
  getPublicEvents(@Query() filter: FilterEventsDto) {
    return this.eventsService.getPublicEvents(filter);
  }

  // PUBLIC: Xem chi tiết sự kiện (guest thấy ít hơn, user thấy đầy đủ)
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Xem chi tiết sự kiện' })
  @ApiResponse({ status: 200, description: 'Chi tiết sự kiện' })
  @ApiResponse({ status: 404, description: 'Sự kiện không tồn tại' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.findOne(id, user);
  }

  // Yêu cầu đăng nhập + role phù hợp
  @Get()
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy danh sách sự kiện (yêu cầu đăng nhập)' })
  @ApiResponse({ status: 200, description: 'Danh sách sự kiện' })
  findAll(@Query() filter: FilterEventsDto, @CurrentUser() user: any) {
    return this.eventsService.findAll(filter, user);
  }

  // Tạo sự kiện - chỉ EVENT_MANAGER & ADMIN
  @Post()
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo sự kiện mới' })
  @ApiResponse({ status: 201, description: 'Tạo sự kiện thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo sự kiện' })
  create(@Body() dto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(dto, user);
  }

  // Sửa sự kiện - chỉ người tạo hoặc Admin
  @Patch(':id')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật thông tin sự kiện' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền sửa sự kiện này' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(id, dto, user);
  }

  // Duyệt / thay đổi trạng thái sự kiện
  @Patch(':id/status')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thay đổi trạng thái sự kiện (duyệt/từ chối/hủy/hoàn thành)' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền thay đổi trạng thái' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.updateStatus(id, dto, user);
  }

  // Lấy mã mời cho sự kiện PRIVATE (chỉ creator hoặc ADMIN)
  @Get(':id/invite-code')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lấy mã mời cho sự kiện PRIVATE' })
  @ApiResponse({ status: 200, description: 'Mã mời sự kiện' })
  @ApiResponse({ status: 403, description: 'Không có quyền lấy mã mời' })
  getInviteCode(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.getInviteCode(id, user);
  }
}