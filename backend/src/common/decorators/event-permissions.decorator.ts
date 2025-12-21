import { SetMetadata } from '@nestjs/common';
import { EventPermission } from '../utils/event-permissions.util';

export const EVENT_PERMISSIONS_KEY = 'event_permissions';

/**
 * Decorator để gắn yêu cầu quyền (bitmask) cho các route liên quan tới Event
 * Sử dụng cùng với EventPermissionsGuard
 * @param permissions - Danh sách các quyền cần thiết (ít nhất một trong số đó)
 * @example
 * @EventPermissions(EventPermission.REGISTRATION_APPROVE)
 * @EventPermissions(EventPermission.POST_REMOVE_OTHERS, EventPermission.MANAGE_DELEGATION)
 */
export const EventPermissions = (...permissions: EventPermission[]) =>
  SetMetadata(EVENT_PERMISSIONS_KEY, permissions);
