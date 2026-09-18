"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ImagePlaceholderIcon } from "@/components/ProductCard";
import { formatBaht } from "@/lib/demo-data";
import type { CartLineItem } from "@/lib/data/cart";
import { updateCartItemQuantity, removeCartItem, clearCart } from "@/lib/actions/cart";

// แยกไฟล์นี้ออกมาจาก page.tsx (2026-09-17) เพราะ motion.xxx เป็น Proxy ที่เรียก
// createMotionComponent() ทันทีตอน property ถูกอ่าน — ถ้าอ่านจากไฟล์ที่ไม่มี
// "use client" (เช่น page.tsx ซึ่งเป็น async Server Component ดึงข้อมูล Supabase)
// จะ error ตอน runtime บนเซิร์ฟเวอร์จริง (บทเรียนจากบั๊กหน้า Home ขั้นตอนที่ 5)
// ไฟล์นี้จึงต้องมี "use client" แล้วรับข้อมูลเป็น props จาก page.tsx แทน

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function CartItemList({ items }: { items: CartLineItem[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="divide-y divide-subtle rounded-[12px] border border-subtle bg-background"
    >
      {items.map((item) => {
        const atMaxStock = item.quantity >= item.product.stockQuantity;
        return (
          <motion.div
            key={item.cartItemId}
            variants={itemVariants}
            className="flex items-center gap-[16px] p-[16px]"
          >
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
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-9 w-9 items-center justify-center text-muted hover:bg-sunken"
                  aria-label="ลดจำนวน"
                >
                  −
                </motion.button>
              </form>
              <span className="flex h-9 w-9 items-center justify-center font-mono text-[14px] font-medium text-ink">
                {item.quantity}
              </span>
              <form action={updateCartItemQuantity}>
                <input type="hidden" name="cartItemId" value={item.cartItemId} />
                <input type="hidden" name="quantity" value={item.quantity + 1} />
                <motion.button
                  type="submit"
                  disabled={atMaxStock}
                  whileHover={atMaxStock ? undefined : { scale: 1.08 }}
                  whileTap={atMaxStock ? undefined : { scale: 0.9 }}
                  title={atMaxStock ? "มีสินค้าไม่พอ" : undefined}
                  className="flex h-9 w-9 items-center justify-center text-ink hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="เพิ่มจำนวน"
                >
                  +
                </motion.button>
              </form>
            </div>

            <p className="min-w-[110px] shrink-0 text-right font-mono text-[18px] font-semibold text-ink">
              {formatBaht(item.product.price * item.quantity)}
            </p>

            <form action={removeCartItem}>
              <input type="hidden" name="cartItemId" value={item.cartItemId} />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="shrink-0 text-[13px] font-medium text-muted transition-colors hover:text-ink"
                aria-label={`ลบ ${item.product.name} ออกจากตะกร้า`}
              >
                ลบ
              </motion.button>
            </form>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function ClearCartButton() {
  return (
    <form action={clearCart}>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
      >
        ล้างตะกร้า
      </motion.button>
    </form>
  );
}

export function OrderSummaryPanel({
  subtotal,
  shipping,
  total,
}: {
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex h-fit w-[340px] shrink-0 flex-col gap-[14px] rounded-[12px] border border-subtle bg-background p-[20px]"
    >
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

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/checkout"
          className="flex h-[48px] items-center justify-center rounded-[10px] bg-ink text-[14px] font-medium text-white transition-opacity hover:opacity-90"
        >
          ดำเนินการชำระเงิน
        </Link>
      </motion.div>

      <p className="pt-1 text-center text-[12px] text-faint">
        จัดส่งด่วน 1–3 วันทำการ ทั่วประเทศ
      </p>
    </motion.aside>
  );
}

export function CartEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 rounded-[12px] border border-subtle bg-background py-20 text-center"
    >
      <p className="text-[20px] font-medium text-ink">ตะกร้าว่าง</p>
      <p className="text-[14px] text-muted">เลือกสินค้าจากร้านเพื่อเพิ่มเข้าตะกร้า</p>
      <Link
        href="/shop"
        className="mt-2 rounded-[10px] bg-ink px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        ← เลือกซื้อสินค้าต่อ
      </Link>
    </motion.div>
  );
}
