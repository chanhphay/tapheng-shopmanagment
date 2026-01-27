-- สร้าง extension สำหรับ uuid
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. สร้างตารางสินค้าหลัก (บอดี้สูท, หมวก, ผ้ากันเปื้อน)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,                -- เช่น 'Body Suit แขนสั้น'
    base_cost NUMERIC DEFAULT 0,       -- ต้นทุนตัวเปล่า
    base_price NUMERIC DEFAULT 0,      -- ราคาขาย
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. สร้างตารางรุ่นย่อย/สี (สำหรับเช็กสต็อก)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    color TEXT NOT NULL,               -- เช่น 'ขาวขอบแดง', 'ฟ้า'
    stock_qty INTEGER DEFAULT 0,       -- จำนวนในสต็อกปัจจุบัน
    size TEXT NOT NULL,                -- เช่น 'S', 'M', 'L', 'XL'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง index สำหรับประสิทธิภาพ
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- สร้าง trigger สำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON product_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. สร้างตารางออเดอร์ลูกค้า
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_clid TEXT NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_amount NUMERIC DEFAULT 0,    -- ราคารวมที่ลูกค้าจ่าย
    other_expenses NUMERIC DEFAULT 0,  -- ค่าส่ง หรือต้นทุนจิปาถะ
    status TEXT DEFAULT '',       -- 'ออกแบบ', 'สกรีน', 'โอนเงินแล้ว', 'จัดส่งแล้ว'
    image_urls TEXT[] DEFAULT '{}',    -- รูปภาพออเดอร์
    tracking_no TEXT,                  -- เลขพัสดุ
    notes TEXT                         -- หมายเหตุอื่นๆ
);

-- 4. สร้างตารางรายการสินค้าในออเดอร์ (เชื่อมสินค้ากับออเดอร์)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    size VARCHAR(2),                -- ขนาดสินค้า ณ วันที่สั่งซื้อ
    unit_price NUMERIC DEFAULT 0       -- ราคาขายต่อชิ้น ณ วันที่ขาย
);

-- สร้าง index สำหรับประสิทธิภาพ
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
