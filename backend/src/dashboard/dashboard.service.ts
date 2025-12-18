// src/dashboard/dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilterDashboardEventsDto } from './dto/request/filter-dashboard-events.dto';
import { DashboardStatsResponseDto } from './dto/response/dashboard-stats-response.dto';
import { DashboardEventResponseDto } from './dto/response/dashboard-event-response.dto';
import { AdminDashboardStatsResponseDto } from './dto/response/admin-dashboard-stats-response.dto';
import { ParticipationHistoryItemDto } from './dto/response/participation-history-response.dto';
import { plainToInstance } from 'class-transformer';
import {
  EventStatus,
  EventVisibility,
  RegistrationStatus,
} from '../generated/prisma/enums';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy thống kê dashboard của user
   */
  async getStats(userId: number): Promise<DashboardStatsResponseDto> {
    const [
      totalEventsCreated,
      totalEventsJoined,
      totalEventsAttended,
      totalPostsCreated,
      totalCommentsCreated,
      totalLikesGiven,
      user,
      upcomingEventsCount,
      activeEventsCount,
    ] = await Promise.all([
      // Số events đã tạo
      this.prisma.event.count({
        where: { creatorId: userId },
      }),
      // Số events đã đăng ký
      this.prisma.registration.count({
        where: {
          userId,
          status: {
            in: [
              RegistrationStatus.APPROVED,
              RegistrationStatus.ATTENDED,
            ],
          },
        },
      }),
      // Số events đã tham gia (ATTENDED)
      this.prisma.registration.count({
        where: {
          userId,
          status: RegistrationStatus.ATTENDED,
        },
      }),
      // Số posts đã tạo
      this.prisma.post.count({
        where: { authorId: userId },
      }),
      // Số comments đã tạo
      this.prisma.comment.count({
        where: { authorId: userId },
      }),
      // Số likes đã cho
      this.prisma.like.count({
        where: { userId },
      }),
      // User info để lấy reputationScore
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { reputationScore: true },
      }),
      // Số events sắp diễn ra đã đăng ký
      this.prisma.registration.count({
        where: {
          userId,
          status: RegistrationStatus.APPROVED,
          event: {
            status: EventStatus.APPROVED,
            startTime: {
              gt: new Date(),
            },
          },
        },
      }),
      // Số events đang diễn ra đã đăng ký
      this.prisma.registration.count({
        where: {
          userId,
          status: RegistrationStatus.APPROVED,
          event: {
            status: EventStatus.APPROVED,
            startTime: {
              lte: new Date(),
            },
            endTime: {
              gte: new Date(),
            },
          },
        },
      }),
    ]);

    return plainToInstance(DashboardStatsResponseDto, {
      totalEventsCreated,
      totalEventsJoined,
      totalEventsAttended,
      totalPostsCreated,
      totalCommentsCreated,
      totalLikesGiven,
      reputationScore: user?.reputationScore || 0,
      upcomingEventsCount,
      activeEventsCount,
    });
  }

  /**
   * Lịch sử tham gia sự kiện của user (dựa trên bảng registrations)
   */
  async getParticipationHistory(
    userId: number,
    filter: FilterDashboardEventsDto,
  ): Promise<ParticipationHistoryItemDto[]> {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const registrations = await this.prisma.registration.findMany({
      where: {
        userId,
      },
      orderBy: {
        registeredAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        status: true,
        registeredAt: true,
        attendedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            coverImage: true,
            startTime: true,
            endTime: true,
            status: true,
            visibility: true,
          },
        },
      },
    });

    return plainToInstance(ParticipationHistoryItemDto, registrations, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Thống kê tổng quan cho ADMIN
   */
  async getAdminStats(): Promise<AdminDashboardStatsResponseDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalEvents,
      totalEventsCompletedThisMonth,
      totalPendingEvents,
      totalUsers,
      activeUsers,
      totalRegistrationsThisMonth,
    ] = await Promise.all([
      // Tổng số sự kiện
      this.prisma.event.count(),
      // Số sự kiện COMPLETED trong tháng hiện tại
      this.prisma.event.count({
        where: {
          status: EventStatus.COMPLETED,
          endTime: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      // Số sự kiện đang chờ duyệt
      this.prisma.event.count({
        where: {
          status: EventStatus.PENDING,
        },
      }),
      // Tổng số user
      this.prisma.user.count(),
      // Số user đang active
      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),
      // Tổng số registrations trong tháng hiện tại
      this.prisma.registration.count({
        where: {
          registeredAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    return plainToInstance(AdminDashboardStatsResponseDto, {
      totalEvents,
      totalEventsCompletedThisMonth,
      totalPendingEvents,
      totalUsers,
      activeUsers,
      totalRegistrationsThisMonth,
    });
  }

  /**
   * Lấy danh sách events được đề xuất cho user
   * Algorithm:
   * - Recency: Events gần đây được ưu tiên
   * - Popularity: viewCount và số lượng đăng ký
   * - Creator reputation: reputationScore của creator
   * - User interaction: Categories mà user đã quan tâm
   * - Visibility/Status: Chỉ APPROVED, PUBLIC/INTERNAL
   */
  async getRecommendedEvents(
    userId: number,
    filter: FilterDashboardEventsDto,
  ) {
    // 1. Lấy categories mà user đã quan tâm (từ events đã đăng ký)
    const userRegistrations = await this.prisma.registration.findMany({
      where: {
        userId,
        status: {
          in: ['APPROVED', 'ATTENDED'],
        },
      },
      select: {
        event: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    const interestedCategoryIds = [
      ...new Set(
        userRegistrations
          .map((r) => r.event.categoryId)
          .filter((id): id is number => id !== null),
      ),
    ];

    // 2. Query events phù hợp
    const where: any = {
      status: EventStatus.APPROVED,
      visibility: {
        in: [EventVisibility.PUBLIC, EventVisibility.INTERNAL],
      },
      startTime: {
        gte: new Date(), // Chỉ lấy events chưa diễn ra
      },
      // Loại bỏ events mà user đã đăng ký
      registrations: {
        none: {
          userId,
          status: {
            in: [
              RegistrationStatus.APPROVED,
              RegistrationStatus.ATTENDED,
            ],
          },
        },
      },
    };

    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    // 3. Lấy events với đầy đủ thông tin
    const events = await this.prisma.event.findMany({
      where,
      skip,
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        registrations: {
          where: {
            status: {
              in: [
                RegistrationStatus.APPROVED,
                RegistrationStatus.ATTENDED,
              ],
            },
          },
          select: {
            id: true,
            userId: true,
            status: true,
          },
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: {
                  in: [
                    RegistrationStatus.APPROVED,
                    RegistrationStatus.ATTENDED,
                  ],
                },
              },
            },
          },
        },
      },
    });

    // 4. Tính recommendation score và map data
    const now = new Date();
    const mappedEvents = events.map((event) => {
      // Tính điểm đề xuất
      let score = 0;

      // Recency: Events gần đây hơn được ưu tiên
      const daysUntilStart =
        (event.startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 30 - daysUntilStart) * 2; // Max 60 points

      // Popularity: viewCount và số lượng đăng ký
      score += Math.min(event.viewCount / 10, 20); // Max 20 points
      score += Math.min(event._count.registrations * 2, 30); // Max 30 points

      // Creator reputation
      score += Math.min(event.creator.reputationScore / 10, 20); // Max 20 points

      // Category match: Nếu user đã quan tâm category này
      if (
        event.categoryId &&
        interestedCategoryIds.includes(event.categoryId)
      ) {
        score += 30; // Bonus 30 points
      }

      // Tìm registration của user (nếu có)
      const userRegistration = event.registrations.find(
        (r) => r.userId === userId,
      );

      return {
        ...event,
        registrationsCount: event._count.registrations,
        isRegistered: !!userRegistration,
        registrationStatus: userRegistration?.status || null,
        recommendationScore: Math.round(score),
      };
    });

    // 5. Sắp xếp theo recommendation score
    mappedEvents.sort((a, b) => b.recommendationScore - a.recommendationScore);

    // 6. Count total
    const total = await this.prisma.event.count({ where });

    return {
      data: mappedEvents.map((event) =>
        plainToInstance(DashboardEventResponseDto, {
          ...event,
          registrations: undefined,
          _count: undefined,
        }),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy danh sách events của user (đã tạo hoặc đã đăng ký)
   */
  async getMyEvents(
    userId: number,
    filter: FilterDashboardEventsDto,
    type: 'created' | 'joined' | 'all' = 'all',
  ) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (type === 'created') {
      where.creatorId = userId;
    } else if (type === 'joined') {
      where.registrations = {
        some: {
          userId,
          status: {
            in: ['APPROVED', 'ATTENDED'],
          },
        },
      };
    } else {
      // all: Events đã tạo HOẶC đã đăng ký
      where.OR = [
        { creatorId: userId },
        {
          registrations: {
            some: {
              userId,
              status: {
                in: [
                  RegistrationStatus.APPROVED,
                  RegistrationStatus.ATTENDED,
                ],
              },
            },
          },
        },
      ];
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              reputationScore: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          registrations: {
            where: {
              userId,
            },
            select: {
              id: true,
              status: true,
            },
            take: 1,
          },
          _count: {
            select: {
              registrations: {
                where: {
                  status: {
                    in: [
                      RegistrationStatus.APPROVED,
                      RegistrationStatus.ATTENDED,
                    ],
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((event) =>
        plainToInstance(DashboardEventResponseDto, {
          ...event,
          registrationsCount: event._count.registrations,
          isRegistered: event.registrations.length > 0,
          registrationStatus: event.registrations[0]?.status || null,
          registrations: undefined,
          _count: undefined,
        }),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy danh sách events sắp diễn ra mà user đã đăng ký
   */
  async getUpcomingEvents(
    userId: number,
    filter: FilterDashboardEventsDto,
  ) {
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const where = {
      registrations: {
        some: {
          userId,
          status: RegistrationStatus.APPROVED,
        },
      },
      status: EventStatus.APPROVED,
      startTime: {
        gte: new Date(),
      },
    };

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: 'asc' },
        include: {
          creator: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              reputationScore: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          registrations: {
            where: {
              userId,
            },
            select: {
              id: true,
              status: true,
            },
            take: 1,
          },
          _count: {
            select: {
              registrations: {
                where: {
                  status: {
                    in: [
                      RegistrationStatus.APPROVED,
                      RegistrationStatus.ATTENDED,
                    ],
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events.map((event) =>
        plainToInstance(DashboardEventResponseDto, {
          ...event,
          registrationsCount: event._count.registrations,
          isRegistered: true,
          registrationStatus: event.registrations[0]?.status || null,
          registrations: undefined,
          _count: undefined,
        }),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

