import Link from "next/link";
import { getCart } from "@/lib/data/cart";
import { CartItemList, ClearCartButton, OrderSummaryPanel, CartEmptyState } from "./CartAnimatedSections";

// Cart ปรับสไตล์ตาม Figma จริง (get_design_context, node-id=1:420 "04 · Cart — POS",
// fileKey UqD5VwG7M7IFPZMoFuoSo2) — คงฟังก์ชันเดิมที่ต่อ Supabase จริงและทดสอบผ่านแล้ว
// ไว้ทั้งหมด (updateCartItemQuantity/removeCartItem เป็น <form action> ธรรมดา ไม่ต้อง
// มี client state, revalidate ให้เองหลังทำรายการ) ปุ่ม "ล้างตะกร้า" ตามดีไซน์
// (server action clearCart ใน lib/actions/cart.ts) — Rail/TopBar ใช้ของ (site)/layout.tsx
// อยู่แล้ว ไม่วาดซ้ำ ตรรกะค่าจัดส่งฟรีเมื่อซื้อครบ 990 บาท ของเดิมยังคงไว้เหมือนเดิม
//
// (2026-09-17) เพิ่มแอนิเมชัน (fade-in/stagger รายการสินค้า + hover/tap ปุ่มต่างๆ)
// โดยแยก JSX ที่ใช้ motion.xxx ทั้งหมดไปไว้ที่ "./CartAnimatedSections.tsx" ที่มี
// "use client" เพราะไฟล์นี้ต้องคงเป็น async Server Component ดึงข้อมูล Supabase ตรงๆ
// (บทเรียนจากบั๊กหน้า Home ขั้นตอนที่ 5: ห้าม import motion เข้ามาไฟล์นี้โดยตรง)

export const metadata = {
  title: "ตะกร้าสินค้า - DeskLab",
  description: "ตรวจสอบสินค้าในตะกร้าก่อนชำระเงินที่ DeskLab",
};

export default async function CartPage() {
  const { items } = await getCart();

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 0 && subtotal < 990 ? 50 : 0;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex gap-[24px] px-[28px] pb-[28px] pt-[24px]">
      <div className="min-w-0 flex-1">
        {items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="flex flex-col gap-[16px]">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-[8px]">
                <h1 className="text-[24px] font-semibold tracking-[-0.2px] text-ink">
                  ตะกร้าสินค้า
                </h1>
                <p className="text-[14px] text-muted">
                  รวมสินค้า {itemCount} ชิ้น จาก {items.length} รายการ
                </p>
              </div>
              <ClearCartButton />
            </div>

            <CartItemList items={items} />

            <Link
              href="/shop"
              className="inline-block w-fit rounded-[10px] border border-default px-4 py-2.5 text-center text-[14px] font-medium text-muted transition-colors hover:bg-sunken"
            >
              ← เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <OrderSummaryPanel subtotal={subtotal} shipping={shipping} total={total} />
      )}
    </div>
  );
}
