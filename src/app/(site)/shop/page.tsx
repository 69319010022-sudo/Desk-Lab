import { getCategories, getProducts } from "@/lib/data/catalog";
import { getCart } from "@/lib/data/cart";
import ShopCatalog from "./ShopCatalog";
import CartAside from "./CartAside";

// Shop ดึงมาจาก Figma จริง (get_design_context, node-id=1:240 "02 · Shop — POS",
// fileKey UqD5VwG7M7IFPZMoFuoSo2) — คอลัมน์ซ้าย: ช่องค้นหา + ชิปหมวดหมู่ + กริดสินค้า
// (ใช้ ProductCard ตัวเดียวกับหน้า Home อยู่แล้ว ไม่สร้างการ์ดใหม่ซ้ำ) คอลัมน์ขวา:
// สรุปตะกร้าปัจจุบัน + ยอดชำระ ดึงข้อมูลจริงจาก Supabase ทั้งหมด — Rail/TopBar ใช้ของ
// (site)/layout.tsx อยู่แล้ว จึงไม่วาดซ้ำในหน้านี้ (ไฟล์อ้างอิงจาก Figma วาด Rail/TopBar
// ของตัวเองมาด้วย ถูกตัดออกเพื่อไม่ให้ซ้อนกับของจริงที่มีอยู่แล้ว)

export const metadata = {
  title: "สินค้าทั้งหมด - DeskLab",
  description: "เลือกซื้ออุปกรณ์จัดโต๊ะคอมพิวเตอร์ครบวงจรที่ DeskLab",
};

export default async function ShopPage() {
  const [categories, products, cart] = await Promise.all([
    getCategories(),
    getProducts(),
    getCart(),
  ]);

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <div className="flex gap-[24px] px-[28px] pb-[28px] pt-[24px]">
      <div className="min-w-0 flex-1">
        <ShopCatalog
          categories={categories}
          products={products}
          categoryNameById={categoryNameById}
        />
      </div>

      <CartAside cart={cart} />
    </div>
  );
}
