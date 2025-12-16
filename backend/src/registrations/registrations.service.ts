import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { decodeInviteCodeOrThrow } from '../common/utils/invite-code.util';
import { JoinByInviteCodeDto } from './dto/join-by-invite.dto';
import {
  EventStatus,
  EventVisibility,
  RegistrationStatus,
  Role,
} from '../generated/prisma/enums';
import { plainToInstance } from 'class-transformer';
import {
  RegistrationResponseDto,
  UserSummaryDto,
} from './dto/response/registration-response.dto';

interface Actor {
  id: number;
  role: Role;
}

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Đăng ký tham gia sự kiện (PUBLIC / INTERNAL)
   */
  async registerForEvent(eventId: number, actor: Actor) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        visibility: true,
        status: true,
        startTime: true,
        endTime: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    if (event.visibility === EventVisibility.PRIVATE) {
      throw new ForbiddenException(
        'Sự kiện private chỉ có thể tham gia bằng mã mời',
      );
    }

    if (event.status !== EventStatus.APPROVED) {
      throw new ForbiddenException('Sự kiện chưa được duyệt');
    }

    const now = new Date();
    if (event.endTime && event.endTime < now) {
      throw new ForbiddenException('Sự kiện đã kết thúc');
    }

    const existing = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: event.id },
      },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    if (existing) {
      if (
        existing.status === RegistrationStatus.KICKED ||
        existing.status === RegistrationStatus.REJECTED
      ) {
        throw new ForbiddenException(
          'Bạn không thể tham gia lại sự kiện này',
        );
      }
      return plainToInstance(RegistrationResponseDto, existing, {
        excludeExtraneousValues: true,
      });
    }

    const registration = await this.prisma.registration.create({
      data: {
        user: { connect: { id: actor.id } },
        event: { connect: { id: event.id } },
        status: RegistrationStatus.APPROVED,
        permissions: 0,
      },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    return plainToInstance(RegistrationResponseDto, registration, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Tham gia sự kiện PRIVATE bằng mã mời
   */
  async joinByInviteCode(dto: JoinByInviteCodeDto, actor: Actor) {
    let eventId: number;
    try {
      eventId = decodeInviteCodeOrThrow(dto.inviteCode);
    } catch (e) {
      throw new ForbiddenException(
        e instanceof Error ? e.message : 'Mã mời không hợp lệ',
      );
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        visibility: true,
        status: true,
        startTime: true,
        endTime: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    if (event.visibility !== EventVisibility.PRIVATE) {
      throw new ForbiddenException('Sự kiện này không sử dụng mã mời');
    }

    if (event.status !== EventStatus.APPROVED) {
      throw new ForbiddenException(
        'Sự kiện chưa được duyệt hoặc đã thay đổi trạng thái',
      );
    }

    const now = new Date();
    if (event.endTime && event.endTime < now) {
      throw new ForbiddenException('Sự kiện đã kết thúc');
    }

    // Nếu đã có registration thì trả về luôn (không tạo mới)
    const existing = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: event.id },
      },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    if (existing) {
      if (
        existing.status === RegistrationStatus.KICKED ||
        existing.status === RegistrationStatus.REJECTED
      ) {
        throw new ForbiddenException(
          'Bạn không thể tham gia lại sự kiện này',
        );
      }
      return plainToInstance(RegistrationResponseDto, existing, {
        excludeExtraneousValues: true,
      });
    }

    // Với PRIVATE event qua mã mời: tự động APPROVED (đã có mã mời hợp lệ)
    const registration = await this.prisma.registration.create({
      data: {
        user: { connect: { id: actor.id } },
        event: { connect: { id: event.id } },
        status: RegistrationStatus.APPROVED,
        permissions: 0,
      },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    return plainToInstance(RegistrationResponseDto, registration, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Danh sách người tham gia 1 sự kiện
   * Chỉ creator hoặc ADMIN được xem (sau này có thể dùng bitmask)
   */
  async getRegistrationsForEvent(eventId: number, actor: Actor) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    const isAdmin = actor.role === Role.ADMIN;
    const isCreator = actor.id === event.creatorId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException(
        'Bạn không có quyền xem danh sách người tham gia sự kiện này',
      );
    }

    const registrations = await this.prisma.registration.findMany({
      where: { eventId: event.id },
      orderBy: { registeredAt: 'asc' },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    return plainToInstance(RegistrationResponseDto, registrations, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Chủ sự kiện / ADMIN cập nhật trạng thái đăng ký (APPROVED, REJECTED, KICKED)
   */
  async updateRegistrationStatus(
    eventId: number,
    registrationId: number,
    status: RegistrationStatus,
    actor: Actor,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    const isAdmin = actor.role === Role.ADMIN;
    const isCreator = actor.id === event.creatorId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException(
        'Bạn không có quyền duyệt đăng ký sự kiện này',
      );
    }

    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId, eventId: event.id },
    });

    if (!registration) {
      throw new NotFoundException('Đăng ký không tồn tại');
    }

    // Có thể thêm rule chi tiết hơn về flow trạng thái nếu cần
    const updated = await this.prisma.registration.update({
      where: { id: registration.id },
      data: { status },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    return plainToInstance(RegistrationResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Check-in cho người tham gia (ATTENDED)
   */
  async checkIn(
    eventId: number,
    registrationId: number,
    actor: Actor,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, creatorId: true },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    const isAdmin = actor.role === Role.ADMIN;
    const isCreator = actor.id === event.creatorId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException(
        'Bạn không có quyền điểm danh cho sự kiện này',
      );
    }

    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId, eventId: event.id },
    });

    if (!registration) {
      throw new NotFoundException('Đăng ký không tồn tại');
    }

    if (registration.status !== RegistrationStatus.APPROVED) {
      throw new ForbiddenException(
        'Chỉ có thể điểm danh người đã được duyệt tham gia',
      );
    }

    const updated = await this.prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: RegistrationStatus.ATTENDED,
        attendedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    return plainToInstance(RegistrationResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Người tham gia tự rời khỏi sự kiện
   */
  async leaveEvent(eventId: number, actor: Actor) {
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId },
      },
    });

    if (!registration) {
      throw new NotFoundException('Bạn chưa tham gia sự kiện này');
    }

    if (
      registration.status === RegistrationStatus.KICKED ||
      registration.status === RegistrationStatus.REJECTED
    ) {
      throw new ForbiddenException(
        'Bạn không thể thay đổi trạng thái đăng ký này',
      );
    }

    const updated = await this.prisma.registration.update({
      where: { id: registration.id },
      data: { status: RegistrationStatus.LEFT },
      select: {
        id: true,
        status: true,
        permissions: true,
        registeredAt: true,
        attendedAt: true,
        eventId: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
      },
    });

    return plainToInstance(RegistrationResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }
}

