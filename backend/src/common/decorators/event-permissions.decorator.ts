import { SetMetadata } from '@nestjs/common';
import { EventPermission } from '../utils/event-permissions.util';

export const EVENT_PERMISSIONS_KEY = 'event_permissions';

/**
 * Decorator để gắn yêu cầu quyền (bitmask) cho các route liên quan tới Event
 * Ví dụ:
 *  - @EventPermissions(EventPermission.REGISTRATION_APPROVE)
 *  - @EventPermissions(EventPermission.POST_REMOVE_OTHERS, EventPermission.MANAGE_DELEGATION)
 */
export const EventPermissions = (...permissions: EventPermission[]) =>
  SetMetadata(EVENT_PERMISSIONS_KEY, permissions);


