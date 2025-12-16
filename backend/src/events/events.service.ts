// src/events/events.service.ts
import {
  Logger,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { EventStatus, EventVisibility, Role } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FilterEventsDto } from './dto/filter-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-status.dto';
import { generateInviteCode } from '../common/utils/invite-code.util';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';

const logger = new Logger('EventsService');

interface Actor {
  id: number;
  role: Role;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private readonly defaultSelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    coverImage: true,
    startTime: true,
    endTime: true,
    status: true,
    visibility: true,
    viewCount: true,
    duration: true,
    createdAt: true,
    updatedAt: true,
    creatorId: true,
    creator: {
      select: { fullName: true, avatar: true },
    },
    category: {
      select: { id: true, name: true, slug: true },
    },
    _count: {
      select: { registrations: true, posts: true },
    },
  };

  private readonly publicSelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    coverImage: true,
    startTime: true,
    endTime: true,
    status: true,
    visibility: true,
    viewCount: true,
    createdAt: true,
    category: {
      select: { id: true, name: true, slug: true },
    },
    _count: {
      select: { registrations: true },
    },
  };

  // Tạo sự kiện
  async create(dto: CreateEventDto, actor: Actor) {
    const data: Prisma.EventCreateInput = {
      title: dto.title.trim(),
      description: dto.description.trim(),
      location: dto.location.trim(),
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      coverImage: dto.coverImage?.trim() || null,
      visibility: dto.visibility ?? EventVisibility.PUBLIC,
      status: EventStatus.PENDING,
      viewCount: 0,
      duration: 0,
      creator: { connect: { id: actor.id } },
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
    };

    return this.prisma.event.create({
      data,
      select: this.defaultSelect,
    });
  }

  /**
   * Lấy mã mời cho sự kiện PRIVATE, có hạn dùng 7 ngày
   * Chỉ sự kiện đang hoạt động (APPROVED và trong khoảng thời gian diễn ra) mới được tạo mã
   */
  async getInviteCode(eventId: number, actor: Actor) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        creatorId: true,
        visibility: true,
        status: true,
        startTime: true,
        endTime: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    const isAdmin = actor.role === Role.ADMIN;
    const isCreator = actor.id === event.creatorId;

    if (!isAdmin && !isCreator) {
      throw new ForbiddenException('Bạn không có quyền lấy mã mời');
    }

    if (event.visibility !== EventVisibility.PRIVATE) {
      throw new ForbiddenException('Chỉ sự kiện PRIVATE mới có mã mời');
    }

    if (event.status !== EventStatus.APPROVED) {
      throw new ForbiddenException(
        'Chỉ sự kiện đã được duyệt mới có thể phát mã mời',
      );
    }

    const now = new Date();
    // Sự kiện đang hoạt động: đã bắt đầu và chưa kết thúc
    if (event.startTime > now || (event.endTime && event.endTime < now)) {
      throw new ForbiddenException(
        'Chỉ sự kiện đang diễn ra mới có thể tạo mã mời',
      );
    }

    // 7 ngày
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const inviteCode = generateInviteCode(event.id, ONE_WEEK_MS);

    return { inviteCode };
  }

  // Danh sách sự kiện công khai (guest)
  async getPublicEvents(filter: FilterEventsDto) {
    logger.log('Filter DTO: ' + JSON.stringify(filter));
    const where = this.buildPublicWhere(filter);
    logger.log('Public Events - Where: ' + JSON.stringify(where));
    return this.queryPaged(
      where,
      filter.page ?? 1,
      filter.limit ?? 10,
      this.publicSelect,
    );
  }

  // Danh sách sự kiện (người đăng nhập)
  async findAll(filter: FilterEventsDto, actor: Actor) {
    if (actor.role === Role.VOLUNTEER) {
      const where = this.buildVolunteerWhere(filter);
      return this.queryPaged(
        where,
        filter.page ?? 1,
        filter.limit ?? 10,
        this.publicSelect,
      );
    }
    const where = this.buildWhere(filter);
    return this.queryPaged(
      where,
      filter.page ?? 1,
      filter.limit ?? 10,
      this.defaultSelect,
    );
  }

  // Chi tiết sự kiện
  async findOne(id: number, actor: Actor | null) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: actor ? this.defaultSelect : this.publicSelect,
    });

    if (!event) throw new NotFoundException('Sự kiện không tồn tại');

    // Kiểm tra visibility nếu là INTERNAL hoặc PRIVATE
    if (!actor) {
      if (
        event.visibility === EventVisibility.INTERNAL ||
        event.visibility === EventVisibility.PRIVATE
      ) {
        throw new ForbiddenException('Sự kiện này chỉ dành cho thành viên');
      }
    }

    return event;
  }

  // Cập nhật sự kiện
  async update(id: number, dto: UpdateEventDto, actor: Actor) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!event) throw new NotFoundException();

    // Chỉ người tạo hoặc Admin được sửa
    if (event.creatorId !== actor.id && actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn chỉ có thể sửa sự kiện do mình tạo');
    }

    const data = this.mapUpdateData(dto);

    return this.prisma.event.update({
      where: { id },
      data,
      select: this.defaultSelect,
    });
  }

  // Thay đổi trạng thái (duyệt, hủy, hoàn thành...)
  async updateStatus(id: number, dto: UpdateEventStatusDto, actor: Actor) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, title: true, creatorId: true, status: true, endTime: true },
    });

    if (!event) throw new NotFoundException('Sự kiện không tồn tại');

    const currentStatus = event.status;
    const targetStatus = dto.status;

    // ADMIN có thể duyệt / từ chối / hoàn thành / hủy
    const isAdmin = actor.role === Role.ADMIN;
    const isCreator = event.creatorId === actor.id;

    // Helper: not allowed by default
    let allowed = false;

    switch (currentStatus) {
      case EventStatus.PENDING:
        if (targetStatus === EventStatus.APPROVED && isAdmin) {
          allowed = true;
        } else if (targetStatus === EventStatus.REJECTED && isAdmin) {
          allowed = true;
        } else if (targetStatus === EventStatus.CANCELLED && (isCreator || isAdmin)) {
          allowed = true;
        }
        break;

      case EventStatus.APPROVED:
        if (targetStatus === EventStatus.CANCELLED && (isCreator || isAdmin)) {
          allowed = true;
        } else if (targetStatus === EventStatus.COMPLETED && (isCreator || isAdmin)) {
          // Optionally: chỉ cho phép COMPLETED sau khi qua endTime
          // if (event.endTime && event.endTime < new Date()) { allowed = true; }
          allowed = true;
        }
        break;

      case EventStatus.REJECTED:
        // Không cho phép chuyển từ REJECTED sang trạng thái khác (cần route riêng nếu muốn)
        allowed = false;
        break;

      case EventStatus.CANCELLED:
      case EventStatus.COMPLETED:
        // Sự kiện đã hủy hoặc hoàn thành thì không cho đổi trạng thái nữa
        allowed = false;
        break;

      default:
        allowed = false;
    }

    if (!allowed) {
      throw new ForbiddenException(
        'Bạn không được phép chuyển trạng thái sự kiện theo cách này',
      );
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: { status: targetStatus },
      select: this.defaultSelect,
    });

    // Gửi notification cho creator khi trạng thái thay đổi (trừ khi chính creator tự thao tác)
    if (event.creatorId && event.creatorId !== actor.id) {
      let title = '';
      let message = '';
      let type: NotificationType | null = null;

      switch (targetStatus) {
        case EventStatus.APPROVED:
          title = 'Sự kiện đã được duyệt';
          message = `Sự kiện "${event.title}" đã được ADMIN duyệt.`;
          type = NotificationType.EVENT_APPROVED;
          break;
        case EventStatus.REJECTED:
          title = 'Sự kiện bị từ chối';
          message = `Sự kiện "${event.title}" đã bị ADMIN từ chối.`;
          type = NotificationType.EVENT_REJECTED;
          break;
        case EventStatus.CANCELLED:
          title = 'Sự kiện đã bị hủy';
          message = `Sự kiện "${event.title}" đã bị hủy.`;
          type = NotificationType.EVENT_CANCELLED;
          break;
        case EventStatus.COMPLETED:
          title = 'Sự kiện đã hoàn thành';
          message = `Sự kiện "${event.title}" đã được đánh dấu là hoàn thành.`;
          type = NotificationType.EVENT_COMPLETED;
          break;
      }

      if (type) {
        await this.notificationsService.createNotification(
          event.creatorId,
          title,
          message,
          type,
          { eventId: event.id, newStatus: targetStatus },
        );
      }
    }

    return updated;
  }

  // Helper methods
  private buildPublicWhere(filter: FilterEventsDto): Prisma.EventWhereInput {
    return {
      ...this.buildBaseWhere(filter),
      visibility: EventVisibility.PUBLIC,
      status: EventStatus.APPROVED,
    };
  }

  private buildVolunteerWhere(filter: FilterEventsDto): Prisma.EventWhereInput {
    return {
      ...this.buildBaseWhere(filter),
      status: EventStatus.APPROVED,
      visibility: {
        in: [EventVisibility.PUBLIC, EventVisibility.INTERNAL],
      },
    };
  }

  private buildWhere(filter: FilterEventsDto): Prisma.EventWhereInput {
    return this.buildBaseWhere(filter);
  }

  private buildBaseWhere(filter: FilterEventsDto): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = {};
    const keyword = filter.keyword?.trim();

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }

    if (filter.from || filter.to) {
      where.startTime = {};
      if (filter.from) where.startTime.gte = new Date(filter.from);
      if (filter.to) where.startTime.lte = new Date(filter.to);
    }

    if (filter.status) {
      if (Array.isArray(filter.status)) {
        where.status = { in: filter.status };
      } else {
        where.status = filter.status;
      }
    }

    if (filter.visibility) {
      where.visibility = filter.visibility;
    }

    if (filter.categoryId) {
      where.categoryId = filter.categoryId;
    }

    return where;
  }

  private mapUpdateData(dto: UpdateEventDto): Prisma.EventUpdateInput {
    const data: Prisma.EventUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.startTime !== undefined)
      data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.coverImage !== undefined)
      data.coverImage = dto.coverImage?.trim() || null;
    if (dto.visibility !== undefined) data.visibility = dto.visibility;
    if (dto.status !== undefined) data.status = dto.status;
    
    // Xử lý category relation đúng cách với Prisma
    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        data.category = { disconnect: true };
      } else {
        data.category = { connect: { id: dto.categoryId } };
      }
    }

    return data;
  }

  private async queryPaged<T>(
    where: Prisma.EventWhereInput,
    page: number,
    limit: number,
    select: any,
  ) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        select,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}