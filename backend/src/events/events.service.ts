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
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EventPermission, buildPermissions } from '../common/utils/event-permissions.util';
import { RegistrationStatus } from '../generated/prisma/enums';

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
    private readonly cloudinary: CloudinaryService,
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

  /**
   * Tạo sự kiện mới
   * Tự động tạo registration cho creator với quyền đầy đủ
   * @param dto - Thông tin sự kiện cần tạo
   * @param actor - Người tạo sự kiện
   * @param file - File ảnh bìa (tùy chọn)
   * @returns Sự kiện đã tạo
   * @throws NotFoundException nếu categoryId không tồn tại
   */
  async create(dto: CreateEventDto, actor: Actor, file?: Express.Multer.File) {
    let coverImageUrl: string | null = null;

    if (file) {
      const uploadResult = await this.cloudinary.uploadImage(file, 'volunteer-hub-events');
      coverImageUrl = uploadResult.secure_url;
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Danh mục với ID ${dto.categoryId} không tồn tại`);
      }
    }

    const data: Prisma.EventCreateInput = {
      title: dto.title.trim(),
      description: dto.description.trim(),
      location: dto.location.trim(),
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      coverImage: coverImageUrl,
      visibility: dto.visibility ?? EventVisibility.PUBLIC,
      status: EventStatus.PENDING,
      viewCount: 0,
      duration: 0,
      creator: { connect: { id: actor.id } },
      category: dto.categoryId
        ? { connect: { id: dto.categoryId } }
        : undefined,
    };

    const creatorPermissions = buildPermissions([
      EventPermission.POST_CREATE,
      EventPermission.POST_APPROVE,
      EventPermission.POST_REMOVE_OTHERS,
      EventPermission.COMMENT_DELETE_OTHERS,
      EventPermission.REGISTRATION_APPROVE,
      EventPermission.REGISTRATION_KICK,
      EventPermission.MANAGE_DELEGATION,
    ]);

    // Tạo event và registration trong cùng một transaction
    const event = await this.prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data,
        select: this.defaultSelect,
      });

      try {
        await tx.registration.create({
          data: {
            userId: actor.id,
            eventId: newEvent.id,
            status: RegistrationStatus.APPROVED,
            permissions: creatorPermissions,
          },
        });
      } catch (error) {
        logger.error(`Failed to create registration for creator ${actor.id} in event ${newEvent.id}:`, error);
        throw error;
      }

      return newEvent;
    });

    return event;
  }

  /**
   * Lấy mã mời cho sự kiện PRIVATE, có hạn dùng 7 ngày
   * Chỉ sự kiện đang hoạt động (APPROVED và trong khoảng thời gian diễn ra) mới được tạo mã
   * @param eventId - ID của sự kiện
   * @param actor - Người yêu cầu (phải là creator hoặc ADMIN)
   * @returns Mã mời sự kiện
   * @throws NotFoundException nếu sự kiện không tồn tại
   * @throws ForbiddenException nếu không có quyền hoặc sự kiện không phải PRIVATE/APPROVED
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
    if (event.startTime > now || (event.endTime && event.endTime < now)) {
      throw new ForbiddenException(
        'Chỉ sự kiện đang diễn ra mới có thể tạo mã mời',
      );
    }

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const inviteCode = generateInviteCode(event.id, ONE_WEEK_MS);

    return { inviteCode };
  }

  /**
   * Lấy danh sách sự kiện công khai (dành cho guest)
   * Chỉ trả về các sự kiện PUBLIC và APPROVED
   * @param filter - Bộ lọc sự kiện
   * @returns Danh sách sự kiện công khai với phân trang
   */
  async getPublicEvents(filter: FilterEventsDto) {
    const where = this.buildPublicWhere(filter);
    return this.queryPaged(
      where,
      filter.page ?? 1,
      filter.limit ?? 10,
      this.publicSelect,
    );
  }

  /**
   * Lấy danh sách sự kiện (dành cho người đã đăng nhập)
   * VOLUNTEER chỉ thấy PUBLIC và INTERNAL events, EVENT_MANAGER và ADMIN thấy tất cả
   * @param filter - Bộ lọc sự kiện (bao gồm status để ADMIN có thể lấy sự kiện PENDING)
   * @param actor - Người dùng hiện tại
   * @returns Danh sách sự kiện với phân trang
   */
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

  /**
   * Lấy chi tiết sự kiện
   * Guest chỉ thấy PUBLIC events, user đã đăng nhập có thể thấy thêm INTERNAL/PRIVATE nếu có quyền
   * Tự động tạo registration cho creator nếu chưa có
   * @param id - ID của sự kiện
   * @param actor - Người dùng hiện tại (có thể null nếu là guest)
   * @returns Chi tiết sự kiện với thông tin registration nếu có user
   * @throws NotFoundException nếu sự kiện không tồn tại
   * @throws ForbiddenException nếu guest cố truy cập INTERNAL/PRIVATE event
   */
  async findOne(id: number, actor: Actor | null) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: actor ? this.defaultSelect : this.publicSelect,
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    if (!actor) {
      if (
        event.visibility === EventVisibility.INTERNAL ||
        event.visibility === EventVisibility.PRIVATE
      ) {
        throw new ForbiddenException('Sự kiện này chỉ dành cho thành viên');
      }
      return event;
    } else {
      const eventWithCreator = event as typeof event & { creatorId: number };
      
      const registration = await this.prisma.registration.findUnique({
        where: {
          userId_eventId: { userId: actor.id, eventId: id },
        },
        select: {
          id: true,
          status: true,
          permissions: true,
        },
      });

      if (eventWithCreator.creatorId === actor.id) {
        if (!registration) {
          const creatorPermissions = buildPermissions([
            EventPermission.POST_CREATE,
            EventPermission.POST_APPROVE,
            EventPermission.POST_REMOVE_OTHERS,
            EventPermission.COMMENT_DELETE_OTHERS,
            EventPermission.REGISTRATION_APPROVE,
            EventPermission.REGISTRATION_KICK,
            EventPermission.MANAGE_DELEGATION,
          ]);

          try {
            const newRegistration = await this.prisma.registration.create({
              data: {
                userId: actor.id,
                eventId: id,
                status: RegistrationStatus.APPROVED,
                permissions: creatorPermissions,
            },
          });
          
          return {
              ...event,
              isMember: true,
              registrationStatus: newRegistration.status,
              isCreator: true,
            };
          } catch (error) {
            logger.error(`[findOne] Failed to auto-create registration for creator ${actor.id} in event ${id}:`, error);
            return {
              ...event,
              isMember: false,
              registrationStatus: null,
              isCreator: true,
            };
          }
        } else {
          return {
            ...event,
            isMember: registration.status === RegistrationStatus.APPROVED || registration.status === RegistrationStatus.ATTENDED,
            registrationStatus: registration.status,
            isCreator: true,
          };
        }
      } else {
        return {
          ...event,
          isMember: registration ? (registration.status === RegistrationStatus.APPROVED || registration.status === RegistrationStatus.ATTENDED) : false,
          registrationStatus: registration?.status || null,
          isCreator: false,
        };
      }
    }
  }

  /**
   * Cập nhật thông tin sự kiện
   * @param id - ID của sự kiện
   * @param dto - Thông tin cần cập nhật
   * @param actor - Người thực hiện (phải là creator hoặc ADMIN)
   * @param file - File ảnh bìa mới (tùy chọn, nếu có sẽ xóa ảnh cũ)
   * @returns Sự kiện đã được cập nhật
   * @throws NotFoundException nếu sự kiện không tồn tại
   * @throws ForbiddenException nếu không có quyền
   */
  async update(id: number, dto: UpdateEventDto, actor: Actor, file?: Express.Multer.File) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { creatorId: true, coverImage: true },
    });

    if (!event) throw new NotFoundException();

    // Chỉ người tạo hoặc Admin được sửa
    if (event.creatorId !== actor.id && actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Bạn chỉ có thể sửa sự kiện do mình tạo');
    }

    const data = this.mapUpdateData(dto);

    if (file) {
      if (event.coverImage) {
        await this.cloudinary.deleteImage(event.coverImage);
      }
      
      const uploadResult = await this.cloudinary.uploadImage(file, 'volunteer-hub-events');
      data.coverImage = uploadResult.secure_url;
    }

    return this.prisma.event.update({
      where: { id },
      data,
      select: this.defaultSelect,
    });
  }

  /**
   * Thay đổi trạng thái sự kiện (duyệt/từ chối/hủy/hoàn thành)
   * ADMIN có thể duyệt/từ chối sự kiện PENDING
   * Creator hoặc ADMIN có thể hủy/hoàn thành sự kiện APPROVED
   * Tự động gửi notification cho creator khi trạng thái thay đổi
   * @param id - ID của sự kiện
   * @param dto - Trạng thái mới
   * @param actor - Người thực hiện
   * @returns Sự kiện đã được cập nhật trạng thái
   * @throws NotFoundException nếu sự kiện không tồn tại
   * @throws ForbiddenException nếu không được phép thay đổi trạng thái
   */
  async updateStatus(id: number, dto: UpdateEventStatusDto, actor: Actor) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: { id: true, title: true, creatorId: true, status: true, endTime: true },
    });

    if (!event) throw new NotFoundException('Sự kiện không tồn tại');

    const currentStatus = event.status;
    const targetStatus = dto.status;

    const isAdmin = actor.role === Role.ADMIN;
    const isCreator = event.creatorId === actor.id;

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
          allowed = true;
        }
        break;

      case EventStatus.REJECTED:
        allowed = false;
        break;

      case EventStatus.CANCELLED:
      case EventStatus.COMPLETED:
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

  /**
   * Xây dựng điều kiện where cho query sự kiện công khai
   * @param filter - Bộ lọc
   * @returns Điều kiện where cho Prisma
   */
  private buildPublicWhere(filter: FilterEventsDto): Prisma.EventWhereInput {
    return {
      ...this.buildBaseWhere(filter),
      visibility: EventVisibility.PUBLIC,
      status: EventStatus.APPROVED,
    };
  }

  /**
   * Xây dựng điều kiện where cho query sự kiện của VOLUNTEER
   * @param filter - Bộ lọc
   * @returns Điều kiện where cho Prisma
   */
  private buildVolunteerWhere(filter: FilterEventsDto): Prisma.EventWhereInput {
    return {
      ...this.buildBaseWhere(filter),
      status: EventStatus.APPROVED,
      visibility: {
        in: [EventVisibility.PUBLIC, EventVisibility.INTERNAL],
      },
    };
  }

  /**
   * Xây dựng điều kiện where cho query sự kiện của EVENT_MANAGER/ADMIN
   * @param filter - Bộ lọc
   * @returns Điều kiện where cho Prisma
   */
  private buildWhere(filter: FilterEventsDto): Prisma.EventWhereInput {
    return this.buildBaseWhere(filter);
  }

  /**
   * Xây dựng điều kiện where cơ bản từ filter
   * @param filter - Bộ lọc (keyword, categoryId, status, visibility, từ ngày, đến ngày)
   * @returns Điều kiện where cơ bản cho Prisma
   */
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

  /**
   * Map dữ liệu từ DTO sang Prisma EventUpdateInput
   * @param dto - DTO cập nhật
   * @returns Dữ liệu cập nhật cho Prisma
   */
  private mapUpdateData(dto: UpdateEventDto): Prisma.EventUpdateInput {
    const data: Prisma.EventUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.description !== undefined)
      data.description = dto.description.trim();
    if (dto.location !== undefined) data.location = dto.location.trim();
    if (dto.startTime !== undefined)
      data.startTime = new Date(dto.startTime);
    if (dto.endTime !== undefined) data.endTime = new Date(dto.endTime);
    if (dto.visibility !== undefined) data.visibility = dto.visibility;
    
    if (dto.categoryId !== undefined) {
      if (dto.categoryId === null) {
        data.category = { disconnect: true };
      } else {
        data.category = { connect: { id: dto.categoryId } };
      }
    }

    return data;
  }

  /**
   * Query sự kiện với phân trang
   * @param where - Điều kiện where
   * @param page - Trang hiện tại
   * @param limit - Số lượng mỗi trang
   * @param select - Các field cần select
   * @returns Dữ liệu với phân trang
   */
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