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
   * @param userId - ID của người dùng
   * @returns Thống kê bao gồm số lượng events, posts, comments, likes, reputation score, và events sắp tới
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
      this.prisma.event.count({
        where: { creatorId: userId },
      }),
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
      this.prisma.registration.count({
        where: {
          userId,
          status: RegistrationStatus.ATTENDED,
        },
      }),
      this.prisma.post.count({
        where: { authorId: userId },
      }),
      this.prisma.comment.count({
        where: { authorId: userId },
      }),
      this.prisma.like.count({
        where: { userId },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { reputationScore: true },
      }),
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
   * Lấy lịch sử tham gia sự kiện của user (dựa trên bảng registrations)
   * @param userId - ID của người dùng
   * @param filter - Bộ lọc phân trang
   * @returns Danh sách lịch sử tham gia sự kiện với thông tin event và trạng thái đăng ký
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
        permissions: true,
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
   * Lấy thống kê tổng quan cho ADMIN
   * @returns Thống kê bao gồm tổng số events, users, registrations và các chỉ số trong tháng hiện tại
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
      this.prisma.event.count(),
      this.prisma.event.count({
        where: {
          status: EventStatus.COMPLETED,
          endTime: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      this.prisma.event.count({
        where: {
          status: EventStatus.PENDING,
        },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          isActive: true,
        },
      }),
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
   * Lấy danh sách events được đề xuất cho user dựa trên thuật toán recommendation
   * Thuật toán tính điểm dựa trên: recency, popularity, creator reputation, và categories mà user đã quan tâm
   * @param userId - ID của người dùng
   * @param filter - Bộ lọc phân trang
   * @returns Danh sách events được đề xuất với điểm recommendation score, đã sắp xếp theo điểm
   */
  async getRecommendedEvents(
    userId: number,
    filter: FilterDashboardEventsDto,
  ) {
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

    const where: any = {
      status: EventStatus.APPROVED,
      visibility: {
        in: [EventVisibility.PUBLIC, EventVisibility.INTERNAL],
      },
      startTime: {
        gte: new Date(),
      },
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

    const now = new Date();
    const mappedEvents = events.map((event) => {
      let score = 0;

      const daysUntilStart =
        (event.startTime.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 30 - daysUntilStart) * 2;

      score += Math.min(event.viewCount / 10, 20);
      score += Math.min(event._count.registrations * 2, 30);

      score += Math.min(event.creator.reputationScore / 10, 20);

      if (
        event.categoryId &&
        interestedCategoryIds.includes(event.categoryId)
      ) {
        score += 30;
      }

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

    mappedEvents.sort((a, b) => b.recommendationScore - a.recommendationScore);

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
   * @param userId - ID của người dùng
   * @param filter - Bộ lọc phân trang
   * @param type - Loại events: 'created' (đã tạo), 'joined' (đã đăng ký), 'all' (tất cả)
   * @returns Danh sách events với thông tin registration của user
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
   * @param userId - ID của người dùng
   * @param filter - Bộ lọc phân trang
   * @returns Danh sách events sắp diễn ra, sắp xếp theo thời gian bắt đầu tăng dần
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

