export enum EventPermission {
  // Đăng post mới trong event
  POST_CREATE = 1 << 0, // 1

  // Gỡ / xóa post của người khác
  POST_REMOVE_OTHERS = 1 << 1, // 2

  // Xác nhận / duyệt post (nếu có flow duyệt)
  POST_APPROVE = 1 << 2, // 4

  // Xóa bình luận của người khác
  COMMENT_DELETE_OTHERS = 1 << 3, // 8

  // Duyệt / từ chối đăng ký tham gia
  REGISTRATION_APPROVE = 1 << 4, // 16

  // Kick một người ra khỏi sự kiện
  REGISTRATION_KICK = 1 << 5, // 32

  // Quản lý nhượng quyền (chỉ creator mặc định có)
  MANAGE_DELEGATION = 1 << 6, // 64
}

/**
 * Kiểm tra user có đầy đủ một quyền cụ thể không
 */
export function hasPermission(
  permissions: number | null | undefined,
  permission: EventPermission,
): boolean {
  if (!permissions) return false;
  return (permissions & permission) === permission;
}

/**
 * Kiểm tra user có ÍT NHẤT MỘT quyền trong danh sách không
 */
export function hasAnyPermission(
  permissions: number | null | undefined,
  requiredPermissions: EventPermission[],
): boolean {
  if (!permissions) return false;
  return requiredPermissions.some((perm) => (permissions & perm) === perm);
}

/**
 * Thêm một quyền vào bitmask
 */
export function addPermission(
  permissions: number | null | undefined,
  permission: EventPermission,
): number {
  const current = permissions ?? 0;
  return current | permission;
}

/**
 * Gỡ một quyền khỏi bitmask
 */
export function removePermission(
  permissions: number | null | undefined,
  permission: EventPermission,
): number {
  const current = permissions ?? 0;
  return current & ~permission;
}

/**
 * Tạo bitmask từ danh sách quyền
 */
export function buildPermissions(perms: EventPermission[]): number {
  return perms.reduce((mask, perm) => mask | perm, 0);
}


