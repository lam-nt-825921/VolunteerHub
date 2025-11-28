import {
  BadRequestException,
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

export interface EventActor {
  id: number;
  role: Role;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultSelect: Prisma.EventSelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    eventDate: true,
    maxParticipants: true,
    thumbnail: true,
    status: true,
    visibility: true,
    createdAt: true,
    updatedAt: true,
    creatorId: true,
  };

  private readonly publicSelect: Prisma.EventSelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    eventDate: true,
    thumbnail: true,
    status: true,
    visibility: true,
  };

  async create(dto: CreateEventDto, actor: EventActor) {
    this.assertCanManage(actor);

    const data: Prisma.EventUncheckedCreateInput = {
      title: dto.title.trim(),
      description: dto.description.trim(),
      location: dto.location.trim(),
      eventDate: new Date(dto.eventDate),
      maxParticipants: dto.maxParticipants ?? null,
      thumbnail: dto.thumbnail?.trim(),
      visibility: dto.visibility ?? EventVisibility.PUBLIC,
      status: this.resolveInitialStatus(actor.role, dto.status),
      creatorId: actor.id,
    };

    return this.prisma.event.create({
      data,
      select: this.defaultSelect,
    });
  }

  async findAll(
    filter: FilterEventsDto,
    actor: EventActor,
  ): Promise<PaginatedResponse<unknown>> {
    this.assertAuthenticated(actor);
    const where = this.buildWhere(filter);
    return this.queryPaged(where, filter.page, filter.limit, this.defaultSelect);
  }

  async getPublicEvents(
    filter: FilterEventsDto,
  ): Promise<PaginatedResponse<unknown>> {
    const where = this.buildWhere(filter, { visibility: EventVisibility.PUBLIC });
    return this.queryPaged(where, filter.page, filter.limit, this.publicSelect);
  }

  async findOne(id: number, actor?: EventActor) {
    const select =
      !actor || actor.role === Role.GUEST
        ? this.publicSelect
        : this.defaultSelect;

    const event = await this.prisma.event.findUnique({
      where: { id },
      select,
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    this.ensureVisibilityAccess(event.visibility, actor);
    return event;
  }

  async update(id: number, dto: UpdateEventDto, actor: EventActor) {
    this.assertCanManage(actor);

    const existing = await this.prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!existing) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    this.assertCanEdit(existing.creatorId, actor);
    const data = this.mapUpdateData(dto, actor);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Không có thay đổi nào để cập nhật');
    }

    return this.prisma.event.update({
      where: { id },
      data,
      select: this.defaultSelect,
    });
  }

  async updateStatus(
    id: number,
    dto: UpdateEventStatusDto,
    actor: EventActor,
  ) {
    this.assertCanManage(actor);

    const existing = await this.prisma.event.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!existing) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    this.assertCanEdit(existing.creatorId, actor);

    return this.prisma.event.update({
      where: { id },
      data: { status: dto.status },
      select: this.defaultSelect,
    });
  }

  private async queryPaged(
    where: Prisma.EventWhereInput,
    page: number,
    limit: number,
    select: Prisma.EventSelect,
  ): Promise<PaginatedResponse<unknown>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
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
        pages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private buildWhere(
    filter: FilterEventsDto,
    overrides: Prisma.EventWhereInput = {},
  ): Prisma.EventWhereInput {
    const where: Prisma.EventWhereInput = { ...overrides };
    const keyword = filter.keyword?.trim();

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { location: { contains: keyword } },
      ];
    }

    const statuses = this.normalizeStatus(filter.status);
    if (statuses?.length) {
      where.status = { in: statuses };
    }

    if (filter.visibility && !overrides.visibility) {
      where.visibility = filter.visibility;
    }

    if (filter.from || filter.to) {
      where.eventDate = {};
      if (filter.from) {
        where.eventDate.gte = new Date(filter.from);
      }
      if (filter.to) {
        where.eventDate.lte = new Date(filter.to);
      }
    }

    return where;
  }

  private mapUpdateData(
    dto: UpdateEventDto,
    actor: EventActor,
  ): Prisma.EventUncheckedUpdateInput {
    const data: Prisma.EventUncheckedUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.eventDate !== undefined) data.eventDate = new Date(dto.eventDate);
    if (dto.maxParticipants !== undefined)
      data.maxParticipants = dto.maxParticipants;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail.trim();

    if (dto.status) {
      this.assertCanModerate(actor);
      data.status = dto.status;
    }

    if (dto.visibility) {
      this.assertCanModerate(actor);
      data.visibility = dto.visibility;
    }

    return data;
  }

  private normalizeStatus(
    status?: EventStatus | EventStatus[],
  ): EventStatus[] | undefined {
    if (!status) return;
    return Array.isArray(status) ? status : [status];
  }

  private resolveInitialStatus(role: Role, requested?: EventStatus) {
    if (role === Role.ADMIN && requested) {
      return requested;
    }
    return EventStatus.PENDING;
  }

  private ensureVisibilityAccess(
    visibility: EventVisibility,
    actor?: EventActor,
  ) {
    if (visibility === EventVisibility.PUBLIC) return;
    if (actor && actor.role !== Role.GUEST) return;
    throw new ForbiddenException('Sự kiện này chỉ dành cho nội bộ');
  }

  private assertAuthenticated(actor?: EventActor): asserts actor is EventActor {
    if (!actor) {
      throw new ForbiddenException('Vui lòng đăng nhập để xem nội dung này');
    }
  }

  private assertCanManage(actor?: EventActor) {
    this.assertAuthenticated(actor);
    if (actor.role === Role.EVENT_MANAGER || actor.role === Role.ADMIN) {
      return;
    }
    throw new ForbiddenException('Bạn không có quyền quản lý sự kiện');
  }

  private assertCanModerate(actor: EventActor) {
    if (
      actor.role === Role.EVENT_MANAGER ||
      actor.role === Role.ADMIN
    ) {
      return;
    }
    throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái');
  }

  private assertCanEdit(creatorId: number, actor: EventActor) {
    if (actor.role === Role.ADMIN) return;
    if (actor.role === Role.EVENT_MANAGER && actor.id === creatorId) {
      return;
    }
    throw new ForbiddenException('Bạn không thể chỉnh sửa sự kiện này');
  }
}

