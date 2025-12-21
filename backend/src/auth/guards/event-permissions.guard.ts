import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { EVENT_PERMISSIONS_KEY } from '../../common/decorators/event-permissions.decorator';
import {
  EventPermission,
  hasAnyPermission,
} from '../../common/utils/event-permissions.util';
import { RegistrationStatus, Role } from '../../generated/prisma/enums';

/**
 * Guard kiểm tra quyền tham gia Event dựa trên bitmask trong bảng Registration
 *
 * Lưu ý:
 * - Guard này giả định request đã qua JwtAuthGuard (có request.user)
 * - Cần lấy được eventId từ:
 *   + params: /events/:eventId/..., /events/:eventId/registrations/...
 *   + hoặc body: { eventId: number }
 */
@Injectable()
export class EventPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Kiểm tra quyền truy cập route dựa trên quyền trong event (bitmask)
   * @param context - Execution context
   * @returns true nếu người dùng có quyền phù hợp
   * @throws ForbiddenException nếu người dùng chưa đăng nhập, không tham gia event, hoặc không có quyền
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      EventPermission[]
    >(EVENT_PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);

    // Nếu route không khai báo @EventPermissions() thì không dùng guard này
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Vui lòng đăng nhập');
    }

    const eventId = await this.extractEventId(request);
    if (!eventId) {
      throw new ForbiddenException(
        'Không xác định được sự kiện để kiểm tra quyền',
      );
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        creatorId: true,
        registrations: {
          where: { userId: user.id },
          select: { 
            permissions: true,
            status: true,
          },
        },
      },
    });

    if (!event) {
      throw new ForbiddenException('Sự kiện không tồn tại');
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    if (event.creatorId === user.id) {
      return true;
    }

    const registration = event.registrations[0];

    if (!registration) {
      throw new ForbiddenException(
        'Bạn không tham gia sự kiện này nên không có quyền thao tác',
      );
    }

    const isBasicPermission = requiredPermissions.includes(EventPermission.POST_CREATE);
    const hasValidStatus = 
      registration.status === RegistrationStatus.APPROVED || 
      registration.status === RegistrationStatus.ATTENDED;
    
    if (isBasicPermission && hasValidStatus) {
      return true;
    }

    const hasPerm = hasAnyPermission(
      registration.permissions,
      requiredPermissions,
    );

    if (!hasPerm) {
      throw new ForbiddenException('Bạn không có quyền thực hiện hành động này');
    }

    return true;
  }

  /**
   * Trích xuất eventId từ request
   * Ưu tiên: params.eventId > params.id > body.eventId > postId (từ DB) > commentId (từ DB)
   * @param request - Request object
   * @returns Event ID hoặc null nếu không tìm thấy
   */
  private async extractEventId(request: any): Promise<number | null> {
    const { params, body } = request;

    if (params?.eventId) {
      return Number(params.eventId);
    }

    if (params?.id) {
      return Number(params.id);
    }

    if (body?.eventId) {
      return Number(body.eventId);
    }

    if (params?.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: Number(params.postId) },
        select: { eventId: true },
      });
      if (post) {
        return post.eventId;
      }
    }

    if (params?.commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: Number(params.commentId) },
        select: { post: { select: { eventId: true } } },
      });
      if (comment?.post) {
        return comment.post.eventId;
      }
    }

    return null;
  }
}


