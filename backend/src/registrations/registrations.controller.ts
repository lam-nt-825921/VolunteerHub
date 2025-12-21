import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { RegistrationsService } from './registrations.service';
import { JoinByInviteCodeDto } from './dto/join-by-invite.dto';
import { UpdateRegistrationStatusDto } from './dto/request/update-registration-status.dto';
import { RegistrationResponseDto } from './dto/response/registration-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../generated/prisma/enums';
import { Roles } from '../common/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { EventPermissions } from '../common/decorators/event-permissions.decorator';
import { EventPermissionsGuard } from '../auth/guards/event-permissions.guard';
import { EventPermission } from '../common/utils/event-permissions.util';
import { RegistrationStatus } from '../generated/prisma/enums';

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
  @ApiOperation({ summary: 'Đăng ký tham gia sự kiện PUBLIC/INTERNAL' })
  @ApiResponse({
    status: 201,
    description: 'Đăng ký thành công, trả về thông tin registration',
    type: RegistrationResponseDto,
  })
  async registerForEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.registerForEvent(eventId, user);
  }

  // Tham gia sự kiện PRIVATE bằng mã mời
  @Post('join-by-code')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Tham gia sự kiện PRIVATE bằng mã mời' })
  @ApiResponse({
    status: 201,
    description: 'Tham gia sự kiện PRIVATE thành công, trả về thông tin registration',
    type: RegistrationResponseDto,
  })
  async joinByInviteCode(
    @Body() dto: JoinByInviteCodeDto,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.joinByInviteCode(dto, user);
  }

  // Danh sách người tham gia 1 sự kiện
  // Cho phép user tham gia sự kiện xem (nhưng chỉ xem APPROVED/ATTENDED nếu không có quyền REGISTRATION_APPROVE)
  @Get(':eventId')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN, Role.VOLUNTEER)
  // Không dùng EventPermissionsGuard - service sẽ tự check quyền và filter data
  @ApiQuery({
    name: 'status',
    required: false,
    enum: RegistrationStatus,
    description:
      'Lọc theo trạng thái đăng ký. Ví dụ: status=PENDING để lấy danh sách đăng ký chờ duyệt. Chỉ có quyền REGISTRATION_APPROVE mới có thể filter PENDING/REJECTED.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách đăng ký của sự kiện. User không có quyền REGISTRATION_APPROVE chỉ thấy APPROVED/ATTENDED.',
    type: RegistrationResponseDto,
    isArray: true,
  })
  async getRegistrationsForEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query('status') status: RegistrationStatus | undefined,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.getRegistrationsForEvent(
      eventId,
      user,
      status,
    );
  }

  // Cập nhật trạng thái đăng ký (APPROVED, REJECTED, KICKED)
  @Patch(':eventId/:registrationId/status')
  @Roles(Role.EVENT_MANAGER, Role.ADMIN, Role.VOLUNTEER)
  @UseGuards(EventPermissionsGuard)
  @EventPermissions(
    EventPermission.REGISTRATION_APPROVE,
    EventPermission.REGISTRATION_KICK,
  )
  @ApiOperation({ summary: 'Cập nhật trạng thái đăng ký (APPROVED, REJECTED, KICKED)' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái đăng ký thành công',
    type: RegistrationResponseDto,
  })
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
  @ApiOperation({ summary: 'Check-in (ATTENDED) cho người tham gia' })
  @ApiResponse({
    status: 200,
    description: 'Điểm danh thành công, trả về thông tin registration đã cập nhật',
    type: RegistrationResponseDto,
  })
  async checkIn(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Param('registrationId', ParseIntPipe) registrationId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.checkIn(eventId, registrationId, user);
  }

  // Người tham gia tự rời khỏi sự kiện (xóa registration để có thể đăng ký lại)
  @Delete(':eventId/leave')
  @Roles(Role.VOLUNTEER, Role.EVENT_MANAGER, Role.ADMIN)
  @ApiOperation({ summary: 'Người tham gia tự rời khỏi sự kiện (xóa registration để có thể đăng ký lại)' })
  @ApiResponse({
    status: 200,
    description: 'Rời khỏi sự kiện thành công, registration đã được xóa',
  })
  async leaveEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @CurrentUser() user: Actor,
  ) {
    return this.registrationsService.leaveEvent(eventId, user);
  }
}

