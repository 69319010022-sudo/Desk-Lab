import Link from "next/link";
import { ImagePlaceholderIcon } from "@/components/ProductCard";
import { formatBaht } from "@/lib/demo-data";
import { getCart } from "@/lib/data/cart";
import { updateCartItemQuantity, removeCartItem, clearCart } from "@/lib/actions/cart";

// Cart ปรับสไตล์ตาม Figma จริง (get_design_context, node-id=1:420 "04 · Cart — POS",
// fileKey UqD5VwG7M7IFPZMoFuoSo2) — คงฟังก์ชันเดิมที่ต่อ Supabase จริงและทดสอบผ่านแล้ว
// ไว้ทั้งหมด (updateCartItemQuantity/removeCartItem เป็น <form action> ธรรมดา ไม่ต้อง
// มี client state, revalidate ให้เองหลังทำรายการ) เพิ่มปุ่ม "ล้างตะกร้า" ใหม่ตามดีไซน์
// (server action clearCart ใน lib/actions/cart.ts) — Rail/TopBar ใช้ของ (site)/layout.tsx
// อยู่แล้ว ไม่วาดซ้ำ ตรรกะค่าจัดส่งฟรีเมื่อซื้อครบ 990 บาท ของเดิมยังคงไว้เหมือนเดิม

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
          <div className="flex flex-col items-center gap-4 rounded-[12px] border border-subtle bg-background py-20 text-center">
            <p className="text-[20px] font-medium text-ink">ตะกร้าว่าง</p>
            <p className="text-[14px] text-muted">เลือกสินค้าจากร้านเพื่อเพิ่มเข้าตะกร้า</p>
            <Link
              href="/shop"
              className="mt-2 rounded-[10px] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              ← เลือกซื้อสินค้าต่อ
            </Link>
          </div>
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
              <form action={clearCart}>
                <button
                  type="submit"
                  className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
                >
                  ล้างตะกร้า
                </button>
              </form>
            </div>

            <div className="divide-y divide-subtle rounded-[12px] border border-subtle bg-background">
              {items.map((item) => {
                const atMaxStock = item.quantity >= item.product.stockQuantity;
                return (
                  <div key={item.cartItemId} className="flex items-center gap-[16px] p-[16px]">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-subtle bg-sunken"
                    >
                      {item.product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <ImagePlaceholderIcon />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-[16px] font-medium text-ink hover:underline"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-1 font-mono text-[13px] text-muted">
                        {formatBaht(item.product.price)} / ชิ้น
                      </p>
                    </div>

                    <div className="flex h-9 shrink-0 items-center overflow-hidden rounded-[8px] border border-default">
                      <form action={updateCartItemQuantity}>
                        <input type="hidden" name="cartItemId" value={item.cartItemId} />
                        <input type="hidden" name="quantity" value={item.quantity - 1} />
                        <button
                          type="submit"
                          className="flex h-9 w-9 items-center justify-center text-muted hover:bg-sunken"
                          aria-label="ลดจำนวน"
                        >
                          −
                        </button>
                      </form>
                      <span className="flex h-9 w-9 items-center justify-center font-mono text-[14px] font-medium text-ink">
                        {item.quantity}
                      </span>
                      <form action={updateCartItemQuantity}>
                        <input type="hidden" name="cartItemId" value={item.cartItemId} />
                        <input type="hidden" name="quantity" value={item.quantity + 1} />
                        <button
                          type="submit"
                          disabled={atMaxStock}
                          title={atMaxStock ? "มีสินค้าไม่พอ" : undefined}
                          className="flex h-9 w-9 items-center justify-center text-ink hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label="เพิ่มจำนวน"
                        >
                          +
                        </button>
                      </form>
                    </div>

                    <p className="min-w-[110px] shrink-0 text-right font-mono text-[18px] font-semibold text-ink">
                      {formatBaht(item.product.price * item.quantity)}
                    </p>

                    <form action={removeCartItem}>
                      <input type="hidden" name="cartItemId" value={item.cartItemId} />
                      <button
                        type="submit"
                        className="shrink-0 text-[13px] font-medium text-muted transition-colors hover:text-ink"
                        aria-label={`ลบ ${item.product.name} ออกจากตะกร้า`}
                      >
                        ลบ
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>

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
        <aside className="flex h-fit w-[340px] shrink-0 flex-col gap-[14px] rounded-[12px] border border-subtle bg-background p-[20px]">
          <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-faint">
            สรุปคำสั่งซื้อ
          </p>

          <div className="flex items-center justify-between">
            <p className="text-[14px] text-muted">ยอดรวมสินค้า</p>
            <p className="font-mono text-[13px] font-medium text-ink">{formatBaht(subtotal)}</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[14px] text-muted">ค่าจัดส่ง</p>
            <p className="font-mono text-[13px] font-medium text-ink">
              {shipping === 0 ? "ฟรี" : formatBaht(shipping)}
            </p>
          </div>

          <div className="h-px bg-subtle" />

          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium text-ink">ยอดชำระทั้งสิ้น</p>
            <p className="font-mono text-[28px] font-semibold tracking-[-0.4px] text-ink">
              {formatBaht(total)}
            </p>
          </div>

          <Link
            href="/checkout"
            className="flex h-[48px] items-center justify-center rounded-[10px] bg-ink text-[14px] font-medium text-white transition-opacity hover:opacity-90"
          >
            ดำเนินการชำระเงิน
          </Link>

          <p className="pt-1 text-center text-[12px] text-faint">
            จัดส่งด่วน 1–3 วันทำการ ทั่วประเทศ
          </p>
        </aside>
      )}
    </div>
  );
}
