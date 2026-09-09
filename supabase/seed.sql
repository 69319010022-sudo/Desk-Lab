-- ============================================================
-- DeskLab — ข้อมูลตัวอย่าง (seed data) สำหรับตาราง categories และ products
-- ขั้นตอน: Supabase Dashboard > SQL Editor > New query > วางทั้งหมดนี้ > Run
-- ใส่ครั้งเดียวพอ ถ้ารันซ้ำจะได้แถวซ้ำ (ไม่มี DROP/DELETE ให้ ป้องกันลบของจริงพลาด)
-- ============================================================

INSERT INTO categories (name, slug, description) VALUES
  ('โคมไฟ', 'lamp', NULL),
  ('แผ่นรองเมาส์', 'mousepad', NULL),
  ('ที่วางจอ', 'monitor-stand', NULL),
  ('ลำโพง', 'speaker', NULL),
  ('ที่วางหูฟัง', 'headphone-stand', NULL);

INSERT INTO products (category_id, name, slug, description, price, stock_quantity, sku, is_active) VALUES
  (
    (SELECT id FROM categories WHERE slug = 'lamp'),
    'โคมไฟตั้งโต๊ะ LED ปรับแสง รุ่น DL-500',
    'led-desk-lamp-dl-500',
    'โคมไฟ LED ปรับความสว่างและอุณหภูมิสีได้ 3 ระดับ พร้อมพอร์ตชาร์จ USB ในตัว รองรับการวางมุมได้หลากหลาย เหมาะสำหรับโต๊ะทำงานและโต๊ะคอมพิวเตอร์',
    590, 42, 'DL-MONO-AL01', true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'mousepad'),
    'แผ่นรองเมาส์ผ้า XL กันลื่น',
    'fabric-mousepad-xl',
    'แผ่นรองเมาส์ผืนใหญ่เนื้อผ้าละเอียด ขอบเย็บกันลุ่ย ผิวลื่นเหมาะกับการใช้งานเกมและทำงาน',
    390, 65, 'DL-PAD-XL02', true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'monitor-stand'),
    'ที่วางจอปรับระดับ Aluminum',
    'monitor-stand-aluminum',
    'ขาตั้งจอมอนิเตอร์วัสดุอลูมิเนียม ปรับความสูงได้ 360 องศา รองรับน้ำหนักได้สูงสุด 32 กก. และเพิ่มพื้นที่ใต้โต๊ะให้เป็นระเบียบมากขึ้น',
    1290, 18, 'DL-MONO-AL01-STAND', true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'speaker'),
    'ลำโพงบลูทูธมินิสำหรับโต๊ะทำงาน',
    'mini-bluetooth-speaker',
    'ลำโพงบลูทูธขนาดเล็ก เสียงใส เบสแน่น แบตอึดใช้งานต่อเนื่องได้นานถึง 10 ชั่วโมง',
    890, 27, 'DL-SPK-MINI03', true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'headphone-stand'),
    'ที่วางหูฟังไม้ธรรมชาติ',
    'wood-headphone-stand',
    'ที่วางหูฟังทำจากไม้แท้ ฐานกันลื่น ดีไซน์เรียบง่ายเข้ากับโต๊ะทำงานทุกสไตล์',
    450, 33, 'DL-HPS-WD04', true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'lamp'),
    'คีย์บอร์ดเมคานิคอล 65%',
    'mechanical-keyboard-65',
    'คีย์บอร์ดเมคานิคอลขนาดกะทัดรัด สวิตช์เสียงหนึบ พิมพ์สบายมือ พร้อมไฟ RGB ปรับได้',
    1990, 15, 'DL-KB-65PCT05', true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'speaker'),
    'ที่ชาร์จไร้สาย 15W',
    'wireless-charger-15w',
    'แท่นชาร์จไร้สายกำลังไฟ 15W ชาร์จเร็ว รองรับสมาร์ตโฟนทุกรุ่นที่ใช้ Qi',
    590, 50, 'DL-CHG-15W06', true
  ),
  (
    (SELECT id FROM categories WHERE slug = 'monitor-stand'),
    'ปลั๊กพ่วง USB ตั้งโต๊ะ',
    'usb-power-strip',
    'ปลั๊กพ่วงพร้อมช่อง USB 4 พอร์ต ยึดติดขอบโต๊ะได้ ช่วยจัดสายไฟให้เป็นระเบียบ',
    690, 40, 'DL-PWR-USB07', true
  );
