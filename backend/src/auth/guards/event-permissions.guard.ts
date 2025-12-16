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

    const eventId = this.extractEventId(request);
    if (!eventId) {
      throw new ForbiddenException(
        'Không xác định được sự kiện để kiểm tra quyền',
      );
    }

    // Lấy event + registration của user trong event đó
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        creatorId: true,
        registrations: {
          where: { userId: user.id },
          select: { permissions: true },
        },
      },
    });

    if (!event) {
      throw new ForbiddenException('Sự kiện không tồn tại');
    }

    // Nếu là creator của event → coi như có full quyền
    if (event.creatorId === user.id) {
      return true;
    }

    const registration = event.registrations[0];

    if (!registration) {
      throw new ForbiddenException(
        'Bạn không tham gia sự kiện này nên không có quyền thao tác',
      );
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
   * Ưu tiên lấy eventId từ:
   * - req.params.eventId
   * - req.params.id (áp dụng cho route như /events/:id/...)
   * - req.body.eventId
   */
  private extractEventId(request: any): number | null {
    const { params, body } = request;

    if (params?.eventId) {
      return Number(params.eventId);
    }

    if (params?.id) {
      // Dùng cho các route dạng /events/:id/...
      return Number(params.id);
    }

    if (body?.eventId) {
      return Number(body.eventId);
    }

    return null;
  }
}


