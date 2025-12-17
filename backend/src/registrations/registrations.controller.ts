import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { JoinByInviteCodeDto } from './dto/join-by-invite.dto';
import { UpdateRegistrationStatusDto } from './dto/request/update-registration-status.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { EventPermissions } from '../common/decorators/event-permissions.decorator';
import { EventPermissionsGuard } from '../auth/guards/event-permissions.guard';
import { EventPermission } from '../common/utils/event-permissions.util';

interface Actor {
  id: number;
  role: Role;
}

@ApiTags('registrations')
@Controller('registrations')
@ApiBearerAuth('JWT-auth')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  // Đăng ký tham gia sự kiện PUBLIC/INTERNAL
  @Post(':eventId')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  async registerForEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.registerForEvent(eventId, user);
  }

  // Tham gia sự kiện PRIVATE bằng mã mời
  @Post('join-by-code')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  async joinByInviteCode(
    @Body() dto: JoinByInviteCodeDto,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.joinByInviteCode(dto, user);
  }

  // Danh sách người tham gia 1 sự kiện
  @Get(':eventId')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN, Role.VOLUNTEER)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(EventPermission.REGISTRATION_APPROVE)
  async getRegistrationsForEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.getRegistrationsForEvent(eventId, user);
  }

  // Cập nhật trạng thái đăng ký (APPROVED, REJECTED, KICKED)
  @Patch(':eventId/:registrationId/status')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN, Role.VOLUNTEER)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(
    EventPermission.REGISTRATION_APPROVE,
    EventPermission.REGISTRATION_KICK,
  )
  async updateRegistrationStatus(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @Body() dto: UpdateRegistrationStatusDto,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.updateRegistrationStatus(
      eventId,
      registrationId,
      dto.status,
      user,
    );
  }

  // Check-in (ATTENDED)
  @Post(':eventId/:registrationId/check-in')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN, Role.VOLUNTEER)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(EventPermission.REGISTRATION_APPROVE)
  async checkIn(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.checkIn(eventId, registrationId, user);
  }

  // Người tham gia tự rời khỏi sự kiện
  @Post(':eventId/leave')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  async leaveEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.leaveEvent(eventId, user);
  }
}

