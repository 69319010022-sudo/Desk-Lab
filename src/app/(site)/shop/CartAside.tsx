"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBaht } from "@/lib/demo-data";
import type { CartData } from "@/lib/data/cart";
import { updateCartItemQuantity } from "@/lib/actions/cart";

// สไลด์เข้ามาตอนตะกร้ามีของชิ้นแรกเท่านั้น — ถ้าตะกร้าว่างไม่เรนเดอร์อะไรเลย
// (ไม่ใช่กล่อง "ตะกร้าว่าง" แบบเดิม) แอนิเมชันมาจาก .cart-slide-in ใน globals.css
// ซึ่งเล่นเองทุกครั้งที่ element นี้ mount ใหม่ (ตอนตะกร้าว่าง -> มีของ)
export default function CartAside({ cart }: { cart: CartData }) {
  const [hidden, setHidden] = useState(false);

  if (cart.items.length === 0) return null;

  if (hidden) {
    return (
      <div className="shrink-0">
        <button
          type="button"
          onClick={() => setHidden(false)}
          className="cart-slide-in flex h-[42px] items-center gap-2 rounded-[10px] bg-ink px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
        >
          แสดงตะกร้า
          <span className="font-mono text-[12px] text-white/60">{cart.itemCount} ชิ้น</span>
        </button>
      </div>
    );
  }

  const cartTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <aside className="cart-slide-in flex w-[340px] shrink-0 flex-col gap-[16px]">
      <div className="rounded-[12px] border border-subtle bg-background p-[18px]">
        <div className="mb-[12px] flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[1.2px] text-faint">
            ตะกร้าปัจจุบัน
          </span>
          <div className="flex items-center gap-[10px]">
            <span className="font-mono text-[13px] font-medium text-muted">
              {cart.itemCount} ชิ้น
            </span>
            <button
              type="button"
              onClick={() => setHidden(true)}
              className="text-[12px] font-medium text-faint transition-colors hover:text-ink"
            >
              ซ่อนตะกร้า
            </button>
          </div>
        </div>

        <div className="divide-y divide-subtle">
          {cart.items.map((item) => {
            const atMaxStock = item.quantity >= item.product.stockQuantity;
            return (
              <div key={item.cartItemId} className="flex gap-[12px] py-[10px] first:pt-0 last:pb-0">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-[7px] bg-sunken">
                  {item.product.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.imageUrl}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {item.product.name}
                  </p>
                  <p className="text-[12px] text-faint">{formatBaht(item.product.price)} / ชิ้น</p>

                  <div className="mt-[8px] flex h-7 w-fit items-center overflow-hidden rounded-[7px] border border-default">
                    <form action={updateCartItemQuantity}>
                      <input type="hidden" name="cartItemId" value={item.cartItemId} />
                      <input type="hidden" name="quantity" value={item.quantity - 1} />
                      <button
                        type="submit"
                        className="flex h-7 w-7 items-center justify-center text-muted hover:bg-sunken"
                        aria-label="ลดจำนวน"
                      >
                        −
                      </button>
                    </form>
                    <span className="flex h-7 w-7 items-center justify-center font-mono text-[12px] font-medium text-ink">
                      {item.quantity}
                    </span>
                    <form action={updateCartItemQuantity}>
                      <input type="hidden" name="cartItemId" value={item.cartItemId} />
                      <input type="hidden" name="quantity" value={item.quantity + 1} />
                      <button
                        type="submit"
                        disabled={atMaxStock}
                        title={atMaxStock ? "มีสินค้าไม่พอ" : undefined}
                        className="flex h-7 w-7 items-center justify-center text-ink hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="เพิ่มจำนวน"
                      >
                        +
                      </button>
                    </form>
                  </div>
                </div>
                <p className="shrink-0 whitespace-nowrap font-mono text-[13px] font-medium text-ink">
                  {formatBaht(item.product.price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-[14px] rounded-[12px] border border-subtle bg-background p-[20px]">
        <p className="text-[11px] font-medium uppercase tracking-[1.2px] text-faint">
          สรุปคำสั่งซื้อ
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-muted">ยอดรวมสินค้า</p>
          <p className="font-mono text-[13px] font-medium text-ink">{formatBaht(cartTotal)}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-muted">ค่าจัดส่ง</p>
          <p className="font-mono text-[13px] font-medium text-ink">฿50</p>
        </div>
        <div className="h-px bg-subtle" />
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-medium text-ink">ยอดชำระทั้งสิ้น</p>
          <p className="font-mono text-[28px] font-semibold tracking-[-0.4px] text-ink">
            {formatBaht(cartTotal + 50)}
          </p>
        </div>
        <Link
          href="/checkout"
          className="flex h-[48px] items-center justify-center rounded-[10px] bg-ink text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          ดำเนินการชำระเงิน
        </Link>
      </div>
    </aside>
  );
}
