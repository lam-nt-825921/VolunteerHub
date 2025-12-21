// src/posts/posts.service.ts
import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/request/create-post.dto';
import {
  UpdatePostDto,
  UpdatePostDtoShape,
} from './dto/request/update-post.dto';
import { FilterPostsDto } from './dto/request/filter-posts.dto';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { UpdateCommentDto } from './dto/request/update-comment.dto';
import {
  PostResponseDto,
  AuthorSummaryDto,
} from './dto/response/post-response.dto';
import {
  CommentResponseDto,
  CommentAuthorDto,
} from './dto/response/comment-response.dto';
import { plainToInstance } from 'class-transformer';
import {
  EventStatus,
  EventVisibility,
  RegistrationStatus,
  PostStatus,
  Role,
} from '../generated/prisma/enums';
import {
  EventPermission,
  hasPermission,
} from '../common/utils/event-permissions.util';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

interface Actor {
  id: number;
  role: Role;
}

const logger = new Logger('PostsService');

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Lấy danh sách posts trong event với phân trang
   * Người có quyền POST_APPROVE hoặc creator: xem tất cả posts (APPROVED, PENDING, REJECTED)
   * Người thường: chỉ xem APPROVED posts + posts của chính mình (trừ REJECTED)
   * Guest: chỉ xem APPROVED posts
   * @param eventId - ID của sự kiện
   * @param filter - Bộ lọc (type, isPinned, status, page, limit)
   * @param actor - Người dùng hiện tại (có thể null nếu là guest)
   * @returns Danh sách posts với phân trang
   */
  async getPostsForEvent(
    eventId: number,
    filter: FilterPostsDto,
    actor: Actor | null,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        visibility: true,
        status: true,
        creatorId: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    if (!actor) {
      if (
        event.visibility === EventVisibility.INTERNAL ||
        event.visibility === EventVisibility.PRIVATE
      ) {
        throw new ForbiddenException('Bạn cần đăng nhập để xem bài đăng');
      }
    } else {
      if (
        event.visibility === EventVisibility.PRIVATE ||
        event.visibility === EventVisibility.INTERNAL
      ) {
        const registration = await this.prisma.registration.findUnique({
          where: {
            userId_eventId: { userId: actor.id, eventId: event.id },
          },
          select: {
            id: true,
            status: true,
          },
        });

        if (!registration) {
          throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
        }
      }
    }

    let canViewPending = false;
    if (actor) {
      const registration = await this.prisma.registration.findUnique({
        where: {
          userId_eventId: { userId: actor.id, eventId: event.id },
        },
        select: { permissions: true },
      });
      
      canViewPending = Boolean(
        actor.id === event.creatorId ||
        (registration &&
          hasPermission(registration.permissions, EventPermission.POST_APPROVE))
      );
    }

    const where: any = {
      eventId: event.id,
    };

    if (canViewPending) {
      if (filter.status) {
        where.status = filter.status;
      }
    } else {
      if (actor) {
        where.OR = [
          { status: PostStatus.APPROVED },
          { 
            AND: [
              { authorId: actor.id },
              { status: { in: [PostStatus.APPROVED, PostStatus.PENDING] } }
            ]
          },
        ];
      } else {
        where.status = PostStatus.APPROVED;
      }
    }

    if (filter.type) {
      where.type = filter.type;
    }

    if (filter.isPinned !== undefined) {
      where.isPinned = filter.isPinned;
    }

    const skip = (filter.page - 1) * filter.limit;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: filter.limit,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          content: true,
          images: true,
          type: true,
          status: true,
          isPinned: true,
          createdAt: true,
          updatedAt: true,
          eventId: true,
          author: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              reputationScore: true,
            },
          },
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    const postIds = posts.map((p) => p.id);
    const userLikes =
      actor && postIds.length > 0
        ? await this.prisma.like.findMany({
            where: {
              userId: actor.id,
              postId: { in: postIds },
            },
            select: { postId: true },
          })
        : [];

    const likedPostIds = new Set(userLikes.map((l) => l.postId));

    const postsWithLikes = posts.map((post) => ({
      ...post,
      images: this.parseImages(post.images),
      commentsCount: post._count.comments,
      likesCount: post._count.likes,
      likedByCurrentUser: actor ? likedPostIds.has(post.id) : false,
    }));

    return {
      data: plainToInstance(PostResponseDto, postsWithLikes, {
        excludeExtraneousValues: true,
      }),
      meta: {
        total,
        page: filter.page,
        limit: filter.limit,
        totalPages: Math.ceil(total / filter.limit),
      },
    };
  }

  /**
   * Tạo post mới trong event
   * User phải tham gia event và có status APPROVED hoặc ATTENDED, hoặc có quyền POST_CREATE
   * Nếu có quyền POST_APPROVE thì post tự động được APPROVED, nếu không thì PENDING
   * @param eventId - ID của sự kiện
   * @param dto - Thông tin post cần tạo
   * @param actor - Người tạo post
   * @param files - Mảng file ảnh (tối đa 10 ảnh, tùy chọn)
   * @returns Post đã tạo
   * @throws NotFoundException nếu event không tồn tại
   * @throws ForbiddenException nếu không có quyền tạo post
   */
  async createPost(eventId: number, dto: CreatePostDto, actor: Actor, files?: Express.Multer.File[]) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        status: true,
        creatorId: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Sự kiện không tồn tại');
    }

    if (event.status !== EventStatus.APPROVED) {
      throw new ForbiddenException('Chỉ có thể đăng bài trong sự kiện đã được duyệt');
    }

    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: event.id },
      },
      select: { permissions: true, status: true },
    });

    if (!registration) {
      throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
    }

    const isValidStatus = 
      registration.status === RegistrationStatus.APPROVED || 
      registration.status === RegistrationStatus.ATTENDED;
    
    if (!isValidStatus) {
      throw new ForbiddenException('Bạn chưa được duyệt tham gia sự kiện hoặc chưa điểm danh');
    }

    const hasPostCreate =
      actor.id === event.creatorId ||
      isValidStatus || // User có status APPROVED/ATTENDED tự động có quyền cơ bản
      hasPermission(registration.permissions, EventPermission.POST_CREATE);

    if (!hasPostCreate) {
      throw new ForbiddenException('Bạn không có quyền đăng bài trong sự kiện này');
    }

    const hasPostApprove =
      actor.id === event.creatorId ||
      hasPermission(registration.permissions, EventPermission.POST_APPROVE);

    let imageUrls: string[] = [];
    if (files && files.length > 0) {
      imageUrls = await this.cloudinary.uploadMultipleImages(files, 'volunteer-hub-posts');
    }

    const post = await this.prisma.post.create({
      data: {
        content: dto.content.trim(),
        images: imageUrls.length > 0 ? JSON.stringify(imageUrls) : '[]',
        type: dto.type || 'DISCUSSION',
        status: hasPostApprove ? PostStatus.APPROVED : PostStatus.PENDING,
        author: { connect: { id: actor.id } },
        event: { connect: { id: event.id } },
      },
      select: {
        id: true,
        content: true,
        images: true,
        type: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const postWithLikes = {
      ...post,
      images: this.parseImages(post.images),
      commentsCount: post._count.comments,
      likesCount: post._count.likes,
      likedByCurrentUser: false,
    };

    const registrations = await this.prisma.registration.findMany({
      where: {
        eventId: event.id,
        userId: { not: actor.id },
        status: RegistrationStatus.APPROVED,
      },
      select: { userId: true },
    });

    const notifiedUserIds = new Set<number>();
    for (const reg of registrations) {
      if (notifiedUserIds.has(reg.userId)) continue;
      notifiedUserIds.add(reg.userId);
      await this.notificationsService.createNotification(
        reg.userId,
        'Bài đăng mới trong sự kiện',
        `Sự kiện bạn tham gia có bài đăng mới.`,
        NotificationType.NEW_POST,
        { eventId: event.id, postId: post.id },
      );
    }

    return plainToInstance(PostResponseDto, postWithLikes, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Lấy chi tiết một post
   * Guest chỉ xem được APPROVED posts, user đã đăng nhập có thể xem thêm nếu là author hoặc có quyền
   * @param postId - ID của post
   * @param actor - Người dùng hiện tại (có thể null nếu là guest)
   * @returns Chi tiết post với likedByCurrentUser
   * @throws NotFoundException nếu post không tồn tại
   * @throws ForbiddenException nếu không có quyền xem
   */
  async getPostById(postId: number, actor: Actor | null) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        content: true,
        images: true,
        type: true,
        status: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
        authorId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
        event: {
          select: {
            visibility: true,
            status: true,
            creatorId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    // Check visibility của event
    if (!actor) {
      if (
        post.event.visibility === EventVisibility.INTERNAL ||
        post.event.visibility === EventVisibility.PRIVATE
      ) {
        throw new ForbiddenException('Bạn cần đăng nhập để xem bài đăng');
      }
      // Guest chỉ xem được APPROVED posts
      if (post.status !== PostStatus.APPROVED) {
        throw new ForbiddenException('Bài đăng không tồn tại hoặc chưa được duyệt');
      }
    } else {
      // Kiểm tra quyền xem post
      const isAuthor = post.authorId === actor.id;
      const isCreator = post.event.creatorId === actor.id;
      
      let canViewPending = isAuthor || isCreator;
      
      if (!canViewPending) {
        const registration = await this.prisma.registration.findUnique({
          where: {
            userId_eventId: { userId: actor.id, eventId: post.eventId },
          },
          select: { permissions: true },
        });
        
        canViewPending = Boolean(
          registration &&
          hasPermission(registration.permissions, EventPermission.POST_APPROVE)
        );
      }
      
      // Chỉ hiển thị APPROVED posts, trừ khi có quyền hoặc là tác giả
      if (post.status !== PostStatus.APPROVED && !canViewPending) {
        throw new ForbiddenException('Bài đăng không tồn tại hoặc chưa được duyệt');
      }
    }

    let liked = null;
    if (actor) {
      try {
        liked = await this.prisma.like.findUnique({
          where: {
            userId_postId: {
              userId: actor.id,
              postId: post.id,
            },
          },
        });
      } catch (error) {
        logger.warn(`findUnique failed, trying findFirst: ${error.message}`);
        liked = await this.prisma.like.findFirst({
          where: {
            userId: actor.id,
            postId: post.id,
          },
        });
      }
    }

    const postWithLikes = {
      ...post,
      images: this.parseImages(post.images),
      commentsCount: post._count.comments,
      likesCount: post._count.likes,
      likedByCurrentUser: !!liked,
    };

    return plainToInstance(PostResponseDto, postWithLikes, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Cập nhật post (chỉ author hoặc có quyền POST_REMOVE_OTHERS)
   * Nếu có ảnh mới sẽ thay thế ảnh cũ, nếu không thì giữ nguyên ảnh cũ
   * @param postId - ID của post
   * @param dto - Thông tin cần cập nhật
   * @param actor - Người thực hiện
   * @param files - Ảnh mới (tùy chọn)
   * @returns Post đã được cập nhật
   * @throws NotFoundException nếu post không tồn tại
   * @throws ForbiddenException nếu không có quyền
   */
  async updatePost(postId: number, dto: UpdatePostDto, actor: Actor, files?: Express.Multer.File[]) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        eventId: true,
        images: true,
        event: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    const isAuthor = post.authorId === actor.id;
    const isEventCreator = post.event.creatorId === actor.id;

    // Lấy registration để check quyền
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: post.eventId },
      },
      select: { permissions: true },
    });

    const hasRemoveOthers =
      isEventCreator ||
      (registration &&
        hasPermission(
          registration.permissions,
          EventPermission.POST_REMOVE_OTHERS,
        ));

    if (!isAuthor && !hasRemoveOthers) {
      throw new ForbiddenException('Bạn không có quyền sửa bài đăng này');
    }

    const update = dto as UpdatePostDtoShape;
    const updateData: any = {};
    if (update.content !== undefined) {
      updateData.content = update.content.trim();
    }
    if (update.type !== undefined) {
      updateData.type = update.type;
    }
    if (dto.isPinned !== undefined) {
      const hasPinPermission =
        isEventCreator ||
        (registration &&
          hasPermission(
            registration.permissions,
            EventPermission.POST_APPROVE,
          ));
      if (!hasPinPermission) {
        throw new ForbiddenException('Bạn không có quyền ghim bài đăng');
      }
      updateData.isPinned = dto.isPinned;
    }

    if (files && files.length > 0) {
      const oldImages = this.parseImages(post.images);
      for (const oldImageUrl of oldImages) {
        if (oldImageUrl) {
          try {
            await this.cloudinary.deleteImage(oldImageUrl);
          } catch (error) {
            console.warn(`Failed to delete old image: ${oldImageUrl}`, error);
          }
        }
      }

      const newImageUrls = await this.cloudinary.uploadMultipleImages(files, 'volunteer-hub-posts');
      updateData.images = JSON.stringify(newImageUrls);
    }

    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data: updateData,
      select: {
        id: true,
        content: true,
        images: true,
        type: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const liked = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId: actor.id, postId: updated.id },
      },
    });

    const postWithLikes = {
      ...updated,
      images: this.parseImages(updated.images),
      commentsCount: updated._count.comments,
      likesCount: updated._count.likes,
      likedByCurrentUser: !!liked,
    };

    return plainToInstance(PostResponseDto, postWithLikes, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Xóa post (chỉ author, event creator hoặc có quyền POST_REMOVE_OTHERS)
   * @param postId - ID của post
   * @param actor - Người thực hiện
   * @returns Thông báo xóa thành công
   * @throws NotFoundException nếu post không tồn tại
   * @throws ForbiddenException nếu không có quyền
   */
  async deletePost(postId: number, actor: Actor) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        eventId: true,
        event: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    const isAuthor = post.authorId === actor.id;
    const isEventCreator = post.event.creatorId === actor.id;

    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: post.eventId },
      },
      select: { permissions: true },
    });

    const hasRemoveOthers =
      isEventCreator ||
      (registration &&
        hasPermission(
          registration.permissions,
          EventPermission.POST_REMOVE_OTHERS,
        ));

    if (!isAuthor && !hasRemoveOthers) {
      throw new ForbiddenException('Bạn không có quyền xóa bài đăng này');
    }

    await this.prisma.post.delete({
      where: { id: post.id },
    });

    return { message: 'Đã xóa bài đăng thành công' };
  }

  /**
   * Toggle pin/unpin post (tự động đảo ngược trạng thái pin)
   * Chỉ người có quyền POST_APPROVE hoặc event creator mới được phép
   * @param postId - ID của post
   * @param actor - Người thực hiện
   * @returns Post đã được toggle pin
   * @throws NotFoundException nếu post không tồn tại
   * @throws ForbiddenException nếu không có quyền
   */
  async pinPost(postId: number, actor: Actor) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        eventId: true,
        isPinned: true,
        event: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    const isEventCreator = post.event.creatorId === actor.id;

    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: post.eventId },
      },
      select: { permissions: true },
    });

    const hasPinPermission =
      isEventCreator ||
      (registration &&
        hasPermission(
          registration.permissions,
          EventPermission.POST_APPROVE,
        ));

    if (!hasPinPermission) {
      throw new ForbiddenException('Bạn không có quyền ghim bài đăng');
    }

    const newIsPinned = !post.isPinned;

    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data: { isPinned: newIsPinned },
      select: {
        id: true,
        content: true,
        images: true,
        type: true,
        status: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const liked = await this.prisma.like.findFirst({
      where: {
        userId: actor.id,
        postId: updated.id,
      },
    });

    const postWithLikes = {
      ...updated,
      images: this.parseImages(updated.images),
      commentsCount: updated._count.comments,
      likesCount: updated._count.likes,
      likedByCurrentUser: !!liked,
    };

    return plainToInstance(PostResponseDto, postWithLikes, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Like một post
   * Tự động gửi notification cho author nếu người like không phải chính author
   * @param postId - ID của post
   * @param actor - Người thực hiện
   * @returns Thông báo like thành công
   * @throws NotFoundException nếu post không tồn tại
   * @throws ForbiddenException nếu chưa tham gia event
   */
  async likePost(postId: number, actor: Actor) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        eventId: true,
        event: {
          select: {
            visibility: true,
            status: true,
          },
        },
        authorId: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: post.eventId },
      },
    });

    if (!registration) {
      throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
    }

    await this.prisma.like.upsert({
      where: {
        userId_postId: { userId: actor.id, postId: post.id },
      },
      update: {},
      create: {
        user: { connect: { id: actor.id } },
        post: { connect: { id: post.id } },
      },
    });

    if (post.authorId && post.authorId !== actor.id) {
      await this.notificationsService.createNotification(
        post.authorId,
        'Bài đăng của bạn được thích',
        'Một người dùng đã thích bài đăng của bạn trong sự kiện.',
        NotificationType.POST_LIKED,
        { postId: post.id, eventId: post.eventId },
      );
    }

    return { message: 'Đã like bài đăng' };
  }

  /**
   * Unlike một post
   * @param postId - ID của post
   * @param actor - Người thực hiện
   * @returns Thông báo unlike thành công
   * @throws NotFoundException nếu chưa like post này
   */
  async unlikePost(postId: number, actor: Actor) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: { userId: actor.id, postId },
      },
    });

    if (!like) {
      throw new NotFoundException('Bạn chưa like bài đăng này');
    }

    await this.prisma.like.delete({
      where: {
        userId_postId: { userId: actor.id, postId },
      },
    });

    return { message: 'Đã unlike bài đăng' };
  }

  /**
   * Lấy danh sách comments của một post với nested replies
   * Comments có parentId sẽ được nhóm vào parent comment (hỗ trợ nested replies)
   * @param postId - ID của post
   * @param actor - Người dùng hiện tại (phải tham gia event, trừ khi là event creator hoặc event là PUBLIC)
   * @returns Danh sách comments với nested replies
   * @throws NotFoundException nếu post không tồn tại
   * @throws ForbiddenException nếu chưa tham gia event (trừ PUBLIC events)
   */
  async getCommentsForPost(postId: number, actor: Actor) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        eventId: true,
        event: {
          select: {
            visibility: true,
            status: true,
            creatorId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    const isEventCreator = post.event.creatorId === actor.id;
    
    if (!isEventCreator) {
      const registration = await this.prisma.registration.findUnique({
        where: {
          userId_eventId: { userId: actor.id, eventId: post.eventId },
        },
        select: { status: true },
      });

      if (!registration) {
        if (post.event.visibility === EventVisibility.PUBLIC) {
          // PUBLIC event cho phép xem comments mà không cần registration
        } else {
          throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
        }
      }
    }

    const allComments = await this.prisma.comment.findMany({
      where: {
        postId: post.id,
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        postId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    const rootComments = allComments.filter((c) => c.parentId === null);
    const replies = allComments.filter((c) => c.parentId !== null);

    const repliesByParent = new Map<number, typeof replies>();
    replies.forEach((reply) => {
      if (reply.parentId) {
        if (!repliesByParent.has(reply.parentId)) {
          repliesByParent.set(reply.parentId, []);
        }
        repliesByParent.get(reply.parentId)!.push(reply);
      }
    });

    const attachReplies = (comment: typeof rootComments[0]): typeof rootComments[0] & { replies: any[] } => {
      const commentReplies = repliesByParent.get(comment.id) || [];
      return {
        ...comment,
        replies: commentReplies.map((reply) => attachReplies(reply as any)),
      };
    };

    const commentsWithReplies = rootComments.map((comment) => attachReplies(comment));

    return plainToInstance(CommentResponseDto, commentsWithReplies, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Tạo comment hoặc reply (nếu có parentId)
   * User phải tham gia event và có status APPROVED hoặc ATTENDED (trừ event creator)
   * Nếu là reply, sẽ gửi notification COMMENT_REPLY cho author của comment cha
   * @param postId - ID của post
   * @param dto - Thông tin comment (content, parentId nếu là reply)
   * @param actor - Người tạo comment
   * @returns Comment đã tạo
   * @throws NotFoundException nếu post hoặc parent comment không tồn tại
   * @throws ForbiddenException nếu không có quyền comment
   */
  async createComment(postId: number, dto: CreateCommentDto, actor: Actor) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        eventId: true,
        event: {
          select: {
            status: true,
            creatorId: true,
          },
        },
        authorId: true,
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    if (post.event.status !== EventStatus.APPROVED) {
      throw new ForbiddenException('Sự kiện chưa được duyệt');
    }

    const isEventCreator = post.event.creatorId === actor.id;

    if (!isEventCreator) {
      const registration = await this.prisma.registration.findUnique({
        where: {
          userId_eventId: { userId: actor.id, eventId: post.eventId },
        },
        select: { status: true },
      });

      if (!registration) {
        throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
      }

      const isValidStatus = 
        registration.status === RegistrationStatus.APPROVED || 
        registration.status === RegistrationStatus.ATTENDED;
      
      if (!isValidStatus) {
        throw new ForbiddenException('Bạn chưa được duyệt tham gia sự kiện hoặc chưa điểm danh');
      }
    }

    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { postId: true },
      });

      if (!parentComment) {
        throw new NotFoundException('Bình luận cha không tồn tại');
      }

      if (parentComment.postId !== post.id) {
        throw new ForbiddenException('Bình luận cha không thuộc bài đăng này');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content.trim(),
        author: { connect: { id: actor.id } },
        post: { connect: { id: post.id } },
        parent: dto.parentId ? { connect: { id: dto.parentId } } : undefined,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        postId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { id: true, authorId: true },
      });

      if (parent && parent.authorId !== actor.id) {
        await this.notificationsService.createNotification(
          parent.authorId,
          'Có phản hồi mới cho bình luận của bạn',
          'Ai đó đã trả lời bình luận của bạn trong sự kiện.',
          NotificationType.COMMENT_REPLY,
          { eventId: post.eventId, postId: post.id, commentId: comment.id, parentId: parent.id },
        );
      }
    }

    return plainToInstance(CommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Cập nhật comment (chỉ author)
   * @param commentId - ID của comment
   * @param dto - Nội dung comment mới
   * @param actor - Người thực hiện
   * @returns Comment đã được cập nhật
   * @throws NotFoundException nếu comment không tồn tại
   * @throws ForbiddenException nếu không phải author
   */
  async updateComment(commentId: number, dto: UpdateCommentDto, actor: Actor) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    if (comment.authorId !== actor.id) {
      throw new ForbiddenException('Bạn chỉ có thể sửa bình luận của chính mình');
    }

    const updated = await this.prisma.comment.update({
      where: { id: comment.id },
      data: { content: dto.content.trim() },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        parentId: true,
        postId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return plainToInstance(CommentResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Xóa comment (chỉ author, event creator hoặc có quyền COMMENT_DELETE_OTHERS)
   * @param commentId - ID của comment
   * @param actor - Người thực hiện
   * @returns Thông báo xóa thành công
   * @throws NotFoundException nếu comment không tồn tại
   * @throws ForbiddenException nếu không có quyền
   */
  async deleteComment(commentId: number, actor: Actor) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        postId: true,
        post: {
          select: {
            eventId: true,
            event: {
              select: {
                creatorId: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Bình luận không tồn tại');
    }

    const isAuthor = comment.authorId === actor.id;
    const isEventCreator = comment.post.event.creatorId === actor.id;

    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId: actor.id,
          eventId: comment.post.eventId,
        },
      },
      select: { permissions: true },
    });

    const hasDeleteOthers =
      isEventCreator ||
      (registration &&
        hasPermission(
          registration.permissions,
          EventPermission.COMMENT_DELETE_OTHERS,
        ));

    if (!isAuthor && !hasDeleteOthers) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    await this.prisma.comment.delete({
      where: { id: comment.id },
    });

    return { message: 'Đã xóa bình luận thành công' };
  }

  /**
   * Duyệt hoặc từ chối post (chỉ người có quyền POST_APPROVE)
   * Chỉ có thể duyệt/từ chối post đang ở trạng thái PENDING
   * Tự động gửi notification cho author và các thành viên khác (nếu được duyệt)
   * @param postId - ID của post
   * @param status - Trạng thái mới: 'APPROVED' hoặc 'REJECTED'
   * @param actor - Người thực hiện
   * @returns Post đã được duyệt/từ chối
   * @throws NotFoundException nếu post không tồn tại
   * @throws ForbiddenException nếu không có quyền hoặc post không ở trạng thái PENDING
   */
  async approvePost(postId: number, status: 'APPROVED' | 'REJECTED', actor: Actor) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        status: true,
        authorId: true,
        eventId: true,
        event: {
          select: {
            creatorId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    // Kiểm tra quyền POST_APPROVE
    const isCreator = post.event.creatorId === actor.id;
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: post.eventId },
      },
      select: { permissions: true },
    });

    const hasApprovePermission =
      isCreator ||
      (registration &&
        hasPermission(registration.permissions, EventPermission.POST_APPROVE));

    if (!hasApprovePermission) {
      throw new ForbiddenException('Bạn không có quyền duyệt bài đăng này');
    }

    if (post.status !== 'PENDING') {
      throw new ForbiddenException(
        `Không thể thay đổi trạng thái bài đăng. Bài đăng hiện tại ở trạng thái: ${post.status}`,
      );
    }

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: { status: status as PostStatus },
      select: {
        id: true,
        content: true,
        images: true,
        type: true,
        status: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        eventId: true,
        author: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            reputationScore: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    const postWithLikes = {
      ...updated,
      images: this.parseImages(updated.images),
      commentsCount: updated._count.comments,
      likesCount: updated._count.likes,
      likedByCurrentUser: false,
    };

    await this.notificationsService.createNotification(
      post.authorId,
      status === 'APPROVED'
        ? 'Bài đăng đã được duyệt'
        : 'Bài đăng bị từ chối',
      status === 'APPROVED'
        ? `Bài đăng của bạn trong sự kiện đã được duyệt.`
        : `Bài đăng của bạn trong sự kiện đã bị từ chối.`,
      NotificationType.POST_STATUS_CHANGED,
      { eventId: post.eventId, postId: post.id, status },
    );

    if (status === 'APPROVED') {
      const registrations = await this.prisma.registration.findMany({
        where: {
          eventId: post.eventId,
          userId: { not: post.authorId },
          status: RegistrationStatus.APPROVED,
        },
        select: { userId: true },
      });

      const notifiedUserIds = new Set<number>();
      for (const reg of registrations) {
        if (notifiedUserIds.has(reg.userId)) continue;
        notifiedUserIds.add(reg.userId);
        await this.notificationsService.createNotification(
          reg.userId,
          'Bài đăng mới trong sự kiện',
          `Sự kiện bạn tham gia có bài đăng mới.`,
          NotificationType.NEW_POST,
          { eventId: post.eventId, postId: post.id },
        );
      }
    }

    return plainToInstance(PostResponseDto, postWithLikes, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Parse images từ JSON string sang array
   * @param images - JSON string chứa mảng URLs hoặc null
   * @returns Mảng URLs ảnh
   */
  private parseImages(images: string | null): string[] {
    if (!images) return [];
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}

