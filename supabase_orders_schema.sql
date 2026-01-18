-- =====================================================
-- SQL SCRIPT: Tạo bảng Orders và Order Items cho ZyeaRSA
-- Bác vào Supabase Dashboard > SQL Editor > Chạy script này
-- =====================================================

-- 1. Bảng ORDERS (Đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(15, 2) DEFAULT 0,
    payment_method VARCHAR(50) DEFAULT 'cash',
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    staff_name VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Bảng ORDER_ITEMS (Chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name VARCHAR(255),
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit_name VARCHAR(50),
    price_at_sale DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS) - QUAN TRỌNG!
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 4. Tạo Policies cho phép tất cả người dùng (authenticated) truy cập
-- Policy cho ORDERS
CREATE POLICY "Allow all for orders" ON orders
    FOR ALL USING (true) WITH CHECK (true);

-- Policy cho ORDER_ITEMS
CREATE POLICY "Allow all for order_items" ON order_items
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Tạo Index để tăng tốc query
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- =====================================================
-- SAU KHI CHẠY SCRIPT NÀY, HÃY THỬ LẠI CHỨC NĂNG THANH TOÁN
-- =====================================================
