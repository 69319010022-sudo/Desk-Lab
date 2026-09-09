import Link from "next/link";
import { getAddresses } from "@/lib/data/addresses";
import { getCart } from "@/lib/data/cart";
import CheckoutForm from "./CheckoutForm";
import BackButton from "./BackButton";

// Checkout: คงฟอร์มเดิมที่เชื่อม Opn Payments จริงไว้ทั้งหมดโดยไม่แตะต้อง เลย
// (CheckoutForm.tsx เชื่อมพร้อมเพย์/บัตร/ปลายทางจริง ผ่านการทดสอบจริงครบทั้ง 3 วิธีจ่ายเงิน
// แล้ว — ความเสี่ยงสูงถ้าแก้ ไม่คุ้มที่จะรื้อแค่เพื่อเรื่องสไตล์) ปรับแค่ wrapper ของหน้าให้ใช้
// padding แบบเดียวกับหน้า Home/Shop/Cart/Product-Detail ที่ปรับตาม Figma ไปแล้ว (ตัด
// Container/Breadcrumb เดิมออกเพื่อความสม่ำเสมอ) — Rail/TopBar ใช้ของ (site)/layout.tsx
// อยู่แล้ว (TopBar โชว์ชื่อหน้า "ชำระเงิน" ให้อัตโนมัติจาก path อยู่แล้ว)
export const metadata = {
  title: "ชำระเงิน - DeskLab",
  description: "ยืนยันที่อยู่จัดส่งและวิธีชำระเงินที่ DeskLab",
};

export default async function CheckoutPage() {
  const [addresses, cart] = await Promise.all([getAddresses(), getCart()]);

  return (
    <div className="flex flex-col gap-6 px-[28px] pb-[32px] pt-[24px]">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-[24px] font-semibold text-ink">ชำระเงิน</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[12px] border border-subtle bg-background py-20 text-center">
          <p className="text-muted">ตะกร้าสินค้าว่างเปล่า ไม่มีอะไรให้ชำระเงิน</p>
          <Link
            href="/shop"
            className="rounded-[10px] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            เลือกซื้อสินค้า
          </Link>
        </div>
      ) : (
        <CheckoutForm addresses={addresses} cartItems={cart.items} />
      )}
    </div>
  );
}
