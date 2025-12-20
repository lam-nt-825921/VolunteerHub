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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-status.dto';
import { FilterEventsDto } from './dto/filter-event.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventStatus, Role } from '../generated/prisma/enums';

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
  @ApiOperation({
    summary: 'Lấy danh sách sự kiện (yêu cầu đăng nhập)',
    description:
      'ADMIN có thể truyền status=PENDING để lấy danh sách **sự kiện chờ duyệt**. Các role khác chỉ thấy sự kiện phù hợp với quyền của mình.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: EventStatus,
    description:
      'Lọc theo trạng thái sự kiện. Ví dụ: status=PENDING để lấy danh sách sự kiện chờ duyệt (ADMIN).',
  })
  @ApiResponse({
    status: 200,
    description:
      'Danh sách sự kiện theo bộ lọc (bao gồm trạng thái, category, thời gian,...). Ví dụ response: [ { \"id\": 1, \"title\": \"Ngày hội tình nguyện\", \"status\": \"PENDING\", \"visibility\": \"PUBLIC\", ... } ]',
    schema: {
      example: [
        {
          id: 1,
          title: 'Ngày hội tình nguyện',
          description: 'Sự kiện dọn rác bờ biển Đà Nẵng',
          location: 'Biển Mỹ Khê, Đà Nẵng',
          coverImage: 'https://res.cloudinary.com/demo/event-cover.jpg',
          startTime: '2025-01-20T08:00:00.000Z',
          endTime: '2025-01-20T12:00:00.000Z',
          status: 'PENDING',
          visibility: 'PUBLIC',
          viewCount: 120,
          duration: 4,
          createdAt: '2025-01-10T10:00:00.000Z',
          creator: {
            id: 10,
            fullName: 'Nguyễn Văn A',
            avatar: 'https://res.cloudinary.com/demo/avatar.jpg',
            reputationScore: 120,
          },
          category: {
            id: 2,
            name: 'Môi trường',
            slug: 'moi-truong',
          },
          registrationsCount: 35,
        },
      ],
    },
  })
  findAll(@Query() filter: FilterEventsDto, @CurrentUser() user: any) {
    return this.eventsService.findAll(filter, user);
  }

  // Tạo sự kiện - chỉ EVENT_MANAGER & ADMIN
  @Post()
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('coverImage'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo sự kiện mới (có thể upload ảnh bìa)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Ngày hội tình nguyện 2025' },
        description: { type: 'string', example: 'Sự kiện tình nguyện lớn nhất năm...' },
        location: { type: 'string', example: 'Công viên Lê Văn Tám, Quận 1, TP.HCM' },
        startTime: { type: 'string', format: 'date-time', example: '2025-01-15T08:00:00Z' },
        endTime: { type: 'string', format: 'date-time', example: '2025-01-15T17:00:00Z' },
        visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE', 'INTERNAL'], example: 'PUBLIC' },
        categoryId: { type: 'integer', example: 1, description: 'ID danh mục sự kiện' },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh bìa sự kiện (JPG, PNG)',
        },
      },
      required: ['title', 'description', 'location', 'startTime', 'endTime'],
    },
  })
  @ApiResponse({ status: 201, description: 'Tạo sự kiện thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền tạo sự kiện' })
  create(
    @Body() dto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.create(dto, user, file);
  }

  // Sửa sự kiện - chỉ người tạo hoặc Admin
  @Patch(':id')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
  @UseInterceptors(FileInterceptor('coverImage'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật thông tin sự kiện (có thể upload ảnh bìa mới)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Ngày hội tình nguyện 2025' },
        description: { type: 'string', example: 'Sự kiện tình nguyện lớn nhất năm...' },
        location: { type: 'string', example: 'Công viên Lê Văn Tám, Quận 1, TP.HCM' },
        startTime: { type: 'string', format: 'date-time', example: '2025-01-15T08:00:00Z' },
        endTime: { type: 'string', format: 'date-time', example: '2025-01-15T17:00:00Z' },
        visibility: { type: 'string', enum: ['PUBLIC', 'PRIVATE', 'INTERNAL'], example: 'PUBLIC' },
        status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'] },
        categoryId: { type: 'integer', example: 1, description: 'ID danh mục sự kiện' },
        coverImage: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh bìa sự kiện mới (JPG, PNG) - Tùy chọn',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền sửa sự kiện này' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(id, dto, user, file);
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