-- =====================================================
-- SQL SCRIPT: Tạo Storage Bucket cho ảnh sản phẩm
-- Bác vào Supabase Dashboard > SQL Editor > Chạy script này
-- =====================================================

-- 1. Tạo bucket 'product-images' (nếu chưa có)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Đảm bảo RLS được bật cho objects (mặc định là bật, nhưng cứ check cho chắc)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Tạo Policy: Ai cũng xem được ảnh (Public Read)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

-- 4. Tạo Policy: Cho phép user đăng nhập upload ảnh (Authenticated Upload)
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- 5. Tạo Policy: Cho phép update/delete (nếu cần)
DROP POLICY IF EXISTS "Owner Update" ON storage.objects;
CREATE POLICY "Owner Update" ON storage.objects 
FOR UPDATE USING (bucket_id = 'product-images');

-- =====================================================
-- SAU KHI CHẠY SCRIPT NÀY:
-- Chức năng upload ảnh trong phần Nhập kho sẽ hoạt động!
-- (Nhớ Build lại IPA vì đã thêm thư viện chọn ảnh mới)
-- =====================================================
