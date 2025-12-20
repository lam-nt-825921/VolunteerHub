-- Script để reset ID của categories về 1,2,3,4
-- Chạy script này trong Neon SQL Editor hoặc psql

-- Bước 1: Xóa tất cả categories hiện tại (nếu có events đang dùng, cần xóa hoặc cập nhật categoryId trước)
-- Lưu ý: Nếu có events đang reference categories, bạn cần xử lý trước
-- UPDATE events SET "categoryId" = NULL WHERE "categoryId" IN (11, 12, 13, 14, 15);

-- Bước 2: Xóa tất cả categories
DELETE FROM categories;

-- Bước 3: Reset sequence về 1
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Bước 4: Tạo lại categories với ID từ 1-4


INSERT INTO categories (id, name, slug) VALUES
(1, 'Môi trường', 'moi-truong'),
(2, 'Giáo dục', 'giao-duc'),
(3, 'Y tế & Sức khỏe', 'y-te'),
(4, 'Cứu trợ thiên tai', 'cuu-tro'),
(5, 'Hỗ trợ người già', 'nguoi-gia');

-- Bước 5: Set sequence tiếp theo là 5 (hoặc 6 nếu có 5 categories)
ALTER SEQUENCE categories_id_seq RESTART WITH 5;
-- Hoặc: ALTER SEQUENCE categories_id_seq RESTART WITH 6; (nếu có 5 categories)

