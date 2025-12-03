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
import { ac, w } from '@faker-js/faker/dist/airline-DF6RqYmq';

const logger = new Logger('EventsService');

interface Actor {
  id: number;
  role: Role;
}

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultSelect = {
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
    creator: {
      select: { fullName: true, avatar: true },
    },
  };

  private readonly publicSelect = {
    id: true,
    title: true,
    description: true,
    location: true,
    eventDate: true,
    thumbnail: true,
    status: true,
    visibility: true,
    createdAt: true,
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
      eventDate: new Date(dto.eventDate),
      maxParticipants: dto.maxParticipants ?? null,
      thumbnail: dto.thumbnail?.trim() || null,
      visibility: dto.visibility ?? EventVisibility.PUBLIC,
      status: actor.role === Role.ADMIN ? (dto.status ?? EventStatus.PENDING) : EventStatus.PENDING,
      creator: { connect: { id: actor.id } },
    };

    return this.prisma.event.create({
      data,
      select: this.defaultSelect,
    });
  }

  // Danh sách sự kiện công khai (guest)
  async getPublicEvents(filter: FilterEventsDto) {
    logger.log('Filter DTO: ' + JSON.stringify(filter));
    const where = this.buildPublicWhere(filter);
    logger.log('Public Events - Where: ' + JSON.stringify(where));
    return this.queryPaged(where, filter.page ?? 1, filter.limit ?? 10, this.publicSelect);
  }

  // Danh sách sự kiện (người đăng nhập)
  async findAll(filter: FilterEventsDto, actor: Actor) {
    if (actor.role === Role.VOLUNTEER) {
      // Volunteer chỉ xem được sự kiện APPROVED, public + internal mà đã tham gia?
      
    }
    const where = this.buildWhere(filter);
    return this.queryPaged(where, filter.page ?? 1, filter.limit ?? 10, this.defaultSelect);
  }

  // Chi tiết sự kiện
  async findOne(id: number, actor: Actor | null) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: actor ? this.defaultSelect : this.publicSelect,
    });

    if (!event) throw new NotFoundException('Sự kiện không tồn tại');

    // Kiểm tra visibility nếu là INTERNAL
    if (event.visibility === EventVisibility.INTERNAL && !actor) {
      throw new ForbiddenException('Sự kiện này chỉ dành cho thành viên');
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
      select: { creatorId: true },
    });

    if (!event) throw new NotFoundException();

    if (event.creatorId !== actor.id && actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền thay đổi trạng thái sự kiện này');
    }

    return this.prisma.event.update({
      where: { id },
      data: { status: dto.status },
      select: this.defaultSelect,
    });
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
      where.eventDate = {};
      if (filter.from) where.eventDate.gte = new Date(filter.from);
      if (filter.to) where.eventDate.lte = new Date(filter.to);
    }

    return where;
  }

  private mapUpdateData(dto: UpdateEventDto): Prisma.EventUpdateInput {
    const data: Prisma.EventUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.eventDate !== undefined) data.eventDate = new Date(dto.eventDate);
    if (dto.maxParticipants !== undefined) data.maxParticipants = dto.maxParticipants;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail?.trim() || null;
    if (dto.visibility !== undefined) data.visibility = dto.visibility;

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
        orderBy: { eventDate: 'asc' },
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