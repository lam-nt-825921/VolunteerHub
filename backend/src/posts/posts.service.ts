// src/posts/posts.service.ts
import {
  ForbiddenException,
  Injectable,
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
  Role,
} from '../generated/prisma/enums';
import {
  EventPermission,
  hasPermission,
} from '../common/utils/event-permissions.util';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/types/notification-type.enum';

interface Actor {
  id: number;
  role: Role;
}

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Danh sách posts trong event (có pagination)
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

    // Check visibility
    if (!actor) {
      if (
        event.visibility === EventVisibility.INTERNAL ||
        event.visibility === EventVisibility.PRIVATE
      ) {
        throw new ForbiddenException('Bạn cần đăng nhập để xem bài đăng');
      }
    } else {
      // Check user đã tham gia event chưa (nếu là PRIVATE hoặc INTERNAL)
      if (
        event.visibility === EventVisibility.PRIVATE ||
        event.visibility === EventVisibility.INTERNAL
      ) {
        const registration = await this.prisma.registration.findUnique({
          where: {
            userId_eventId: { userId: actor.id, eventId: event.id },
          },
        });

        if (!registration) {
          throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
        }
      }
    }

    const where: any = {
      eventId: event.id,
    };

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
          { isPinned: 'desc' }, // Pinned posts lên đầu
          { createdAt: 'desc' },
        ],
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
      }),
      this.prisma.post.count({ where }),
    ]);

    // Check likedByCurrentUser cho mỗi post
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
   */
  async createPost(eventId: number, dto: CreatePostDto, actor: Actor) {
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

    // Check quyền: phải tham gia event hoặc có POST_CREATE permission
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: event.id },
      },
      select: { permissions: true, status: true },
    });

    if (!registration) {
      throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
    }

    if (registration.status !== RegistrationStatus.APPROVED) {
      throw new ForbiddenException('Bạn chưa được duyệt tham gia sự kiện');
    }

    const hasPostCreate =
      actor.id === event.creatorId ||
      hasPermission(registration.permissions, EventPermission.POST_CREATE);

    if (!hasPostCreate) {
      throw new ForbiddenException('Bạn không có quyền đăng bài trong sự kiện này');
    }

    const post = await this.prisma.post.create({
      data: {
        content: dto.content.trim(),
        images: dto.images ? JSON.stringify(dto.images) : '[]',
        type: dto.type || 'DISCUSSION',
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

    // Gửi notification NEW_POST cho các thành viên khác của event (trừ người tạo)
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
   * Chi tiết 1 post
   */
  async getPostById(postId: number, actor: Actor | null) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
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
        event: {
          select: {
            visibility: true,
            status: true,
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
    }

    const liked = actor
      ? await this.prisma.like.findUnique({
          where: {
            userId_postId: { userId: actor.id, postId: post.id },
          },
        })
      : null;

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
   * Sửa post (chỉ author hoặc có POST_REMOVE_OTHERS)
   */
  async updatePost(postId: number, dto: UpdatePostDto, actor: Actor) {
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
    if (update.images !== undefined) {
      updateData.images = JSON.stringify(update.images);
    }
    if (update.type !== undefined) {
      updateData.type = update.type;
    }
    // isPinned chỉ event creator hoặc có POST_APPROVE mới được sửa
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
   * Xóa post (author hoặc POST_REMOVE_OTHERS hoặc event creator)
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
   * Pin/Unpin post (POST_APPROVE hoặc event creator)
   */
  async pinPost(postId: number, isPinned: boolean, actor: Actor) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
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

    const updated = await this.prisma.post.update({
      where: { id: post.id },
      data: { isPinned },
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
   * Like post
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

    // Check user đã tham gia event chưa
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: post.eventId },
      },
    });

    if (!registration) {
      throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
    }

    // Upsert like (nếu đã like rồi thì không làm gì)
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

    // Thông báo cho author nếu người like không phải chính author
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
   * Unlike post
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
   * Danh sách comments của 1 post (nested replies)
   */
  async getCommentsForPost(postId: number, actor: Actor | null) {
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
      },
    });

    if (!post) {
      throw new NotFoundException('Bài đăng không tồn tại');
    }

    // Check visibility
    if (!actor) {
      if (
        post.event.visibility === EventVisibility.INTERNAL ||
        post.event.visibility === EventVisibility.PRIVATE
      ) {
        throw new ForbiddenException('Bạn cần đăng nhập để xem bình luận');
      }
    }

    // Lấy comments gốc (parentId = null)
    const rootComments = await this.prisma.comment.findMany({
      where: {
        postId: post.id,
        parentId: null,
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

    // Lấy replies cho mỗi comment gốc
    const rootCommentIds = rootComments.map((c) => c.id);
    const replies = rootCommentIds.length > 0
      ? await this.prisma.comment.findMany({
          where: {
            postId: post.id,
            parentId: { in: rootCommentIds },
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
        })
      : [];

    // Group replies by parentId
    const repliesByParent = new Map<number, typeof replies>();
    replies.forEach((reply) => {
      if (reply.parentId) {
        if (!repliesByParent.has(reply.parentId)) {
          repliesByParent.set(reply.parentId, []);
        }
        repliesByParent.get(reply.parentId)!.push(reply);
      }
    });

    // Attach replies to root comments
    const commentsWithReplies = rootComments.map((comment) => ({
      ...comment,
      replies: repliesByParent.get(comment.id) || [],
    }));

    return plainToInstance(CommentResponseDto, commentsWithReplies, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Tạo comment/reply
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

    // Check user đã tham gia event chưa
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId: actor.id, eventId: post.eventId },
      },
    });

    if (!registration) {
      throw new ForbiddenException('Bạn chưa tham gia sự kiện này');
    }

    // Nếu là reply, check parent comment tồn tại và cùng post
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

    // Notification COMMENT_REPLY: nếu là reply và không phải reply vào comment của chính mình
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
          { postId: post.id, commentId: comment.id, parentId: parent.id },
        );
      }
    }

    return plainToInstance(CommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  /**
   * Sửa comment (chỉ author)
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
   * Xóa comment (author hoặc COMMENT_DELETE_OTHERS hoặc event creator)
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
   * Helper: Parse images JSON string to array
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

