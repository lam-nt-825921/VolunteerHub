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
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-status.dto';
import { FilterEventsDto } from './dto/filter-event.dto';

import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import {CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/enums';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // PUBLIC: Ai cũng xem được (guest + user)
  @Get('public')
  @Public()
  getPublicEvents(@Query() filter: FilterEventsDto) {
    return this.eventsService.getPublicEvents(filter);
  }

  // PUBLIC: Xem chi tiết sự kiện (guest thấy ít hơn, user thấy đầy đủ)
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.findOne(id, user);
  }

  // Yêu cầu đăng nhập + role phù hợp
  @Get()
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  findAll(@Query() filter: FilterEventsDto, @CurrentUser() user: any) {
    return this.eventsService.findAll(filter, user);
  }

  // Tạo sự kiện - chỉ EVENT_MANAGER & ADMIN
  @Post()
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
  create(@Body() dto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(dto, user);
  }

  // Sửa sự kiện - chỉ người tạo hoặc Admin
  @Patch(':id')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN)
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
  getInviteCode(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.getInviteCode(id, user);
  }
}