-- Script AN TOÀN để reset ID của categories về 1,2,3,4
-- Script này sẽ giữ nguyên các events đang có và chỉ cập nhật categoryId

-- Bước 1: Kiểm tra categories hiện tại và events đang dùng
-- SELECT id, name, slug FROM categories ORDER BY id;
-- SELECT COUNT(*) as events_using_category FROM events WHERE "categoryId" IN (11, 12, 13, 14, 15);

-- Bước 2: Tạo mapping từ ID cũ sang ID mới
-- Giả sử bạn có 4 categories với ID 11,12,13,14 tương ứng với:
-- 11 -> 1 (Môi trường)
-- 12 -> 2 (Giáo dục)  
-- 13 -> 3 (Y tế & Sức khỏe)
-- 14 -> 4 (Cứu trợ thiên tai)
-- 15 -> 5 (Hỗ trợ người già) - nếu có

-- Bước 3: Cập nhật categoryId trong events theo mapping
-- UPDATE events SET "categoryId" = 1 WHERE "categoryId" = 11;
-- UPDATE events SET "categoryId" = 2 WHERE "categoryId" = 12;
-- UPDATE events SET "categoryId" = 3 WHERE "categoryId" = 13;
-- UPDATE events SET "categoryId" = 4 WHERE "categoryId" = 14;
-- UPDATE events SET "categoryId" = 5 WHERE "categoryId" = 15; -- nếu có

-- Bước 4: Xóa categories cũ
DELETE FROM categories WHERE id IN (11, 12, 13, 14, 15);

-- Bước 5: Reset sequence về 1
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Bước 6: Tạo lại categories với ID mới
INSERT INTO categories (id, name, slug) VALUES
(1, 'Môi trường', 'moi-truong'),
(2, 'Giáo dục', 'giao-duc'),
(3, 'Y tế & Sức khỏe', 'y-te'),
(4, 'Cứu trợ thiên tai', 'cuu-tro')
ON CONFLICT (id) DO NOTHING;

-- Bước 7: Set sequence tiếp theo
ALTER SEQUENCE categories_id_seq RESTART WITH 5;

