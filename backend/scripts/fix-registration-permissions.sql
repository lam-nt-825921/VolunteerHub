-- Script để sửa permissions cho các registration đã được approve nhưng chưa có quyền cơ bản
-- 
-- Quyền cơ bản khi được approve (APPROVED hoặc ATTENDED):
-- - Xem post: Chỉ cần có registration (không cần permission)
-- - Like post: Chỉ cần có registration (không cần permission)
-- - Comment: Chỉ cần có registration với status APPROVED/ATTENDED (không cần permission)
-- - Đăng post: Cần POST_CREATE permission (value = 1)
--
-- Vậy permissions = 1 (POST_CREATE) là đủ cho quyền cơ bản
-- Các quyền khác (xem, like, comment) được kiểm tra qua registration status, không cần permission bitmask

-- 1. Xem trước số lượng records sẽ bị ảnh hưởng
SELECT 
    status,
    COUNT(*) as count,
    COUNT(CASE WHEN permissions < 1 OR permissions IS NULL THEN 1 END) as need_fix
FROM registrations
WHERE status IN ('APPROVED', 'ATTENDED')
GROUP BY status;

-- 2. Xem chi tiết các records sẽ được update
SELECT 
    id,
    "userId",
    "eventId",
    status,
    permissions,
    "registeredAt"
FROM registrations
WHERE status IN ('APPROVED', 'ATTENDED')
  AND (permissions < 1 OR permissions IS NULL)
ORDER BY id;

-- 3. Update permissions = 1 (POST_CREATE) cho các registration có status APPROVED hoặc ATTENDED
--    nhưng permissions < 1 hoặc NULL
UPDATE registrations
SET permissions = 1
WHERE status IN ('APPROVED', 'ATTENDED')
  AND (permissions < 1 OR permissions IS NULL);

-- 4. Kiểm tra kết quả sau khi update
SELECT 
    status,
    permissions,
    COUNT(*) as count
FROM registrations
WHERE status IN ('APPROVED', 'ATTENDED')
GROUP BY status, permissions
ORDER BY status, permissions;

