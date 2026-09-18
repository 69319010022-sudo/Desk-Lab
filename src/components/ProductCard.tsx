"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Product, formatBaht } from "@/lib/demo-data";
import { addToCartAction, type CartActionState } from "@/lib/actions/cart";

// Tile/Product ดึงมาจาก Figma จริง (get_design_context, node 1:300 "01 · Home — POS")
// รูปสูง 176px, eyebrow หมวดหมู่ (ถ้ามีส่งเข้ามา), ชื่อสินค้า, แถวราคา + ปุ่มตะกร้าสี่เหลี่ยมเล็ก
// แทนปุ่มข้อความเต็มความกว้างแบบเดิม — categoryName เป็น optional เพื่อไม่กระทบหน้าที่ยังไม่ได้อัปเดต
//
// อัปเดต (2026-09-16): เพิ่ม micro-animation ด้วยไลบรารี Motion (แรงบันดาลใจจากแพทเทิร์นการ์ดสินค้า
// บน 21st.dev ที่นิยมใช้ hover-lift + image zoom + tap feedback) — การ์ดยกขึ้น/เงาเข้มขึ้นตอน hover,
// รูปซูมเล็กน้อย, ปุ่มหยิบใส่ตะกร้ามี tap feedback — เป็นแค่ชั้น visual ครอบไว้เท่านั้น การทำงานจริง
// เหมือนเดิมทุกประการ
//
// อัปเดต (2026-09-16, ขั้นตอนที่ 3): เปลี่ยนจาก <form action={addToCart}> (fire-and-forget) มาใช้
// useActionState(addToCartAction, ...) แบบเดียวกับ AddToCartForm.tsx ของหน้า Product-Detail
// (ไม่ได้แก้ server action ใดๆ เลย ใช้ addToCartAction เดิมที่มีอยู่แล้ว) เพื่อให้รู้ตอนเพิ่มสำเร็จจริง
// แล้วสลับไอคอนเป็นเครื่องหมายถูกชั่วคราว ~1.5 วินาที

const cardVariants = {
  rest: { y: 0, boxShadow: "0 1px 2px rgba(15, 15, 15, 0.04)" },
  hover: { y: -4, boxShadow: "0 16px 28px rgba(15, 15, 15, 0.12)" },
};

const imageVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.06 },
};

export default function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const inStock = product.stockQuantity > 0;
  const [state, formAction, isPending] = useActionState<CartActionState, FormData>(
    addToCartAction,
    null,
  );
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!state?.success) return;
    // ตั้งใจให้ทำงานทันทีที่ server action สำเร็จ (state เป็น object ใหม่ทุกครั้งที่ addToCartAction
    // คืนค่า success) เพื่อสลับไอคอนเป็นเครื่องหมายถูก แล้ว setTimeout รีเซ็ตกลับเองโดยอัตโนมัติ —
    // แพทเทิร์นเดียวกับที่เคยแก้ไว้ใน admin-catalog สำหรับกฎ set-state-in-effect นี้
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setJustAdded(true);
    const timeout = setTimeout(() => setJustAdded(false), 1500);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardVariants}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="flex flex-col overflow-hidden rounded-[8px] border border-subtle bg-background"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="flex h-[176px] items-center justify-center overflow-clip rounded-t-[8px] bg-sunken text-muted">
          {product.images[0] ? (
            <motion.img
              variants={imageVariants}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <ImagePlaceholderIcon />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-[10px] px-[14px] pb-[14px] pt-[12px]">
        {categoryName && (
          <p className="text-[11px] uppercase tracking-[1.2px] text-faint">
            {categoryName}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-[14px] font-medium text-ink hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <p className="font-mono text-[20px] font-semibold tracking-[-0.2px] text-ink">
            {formatBaht(product.price)}
          </p>
          <form action={formAction}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value={1} />
            <motion.button
              type="submit"
              disabled={!inStock || isPending}
              aria-label={inStock ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
              whileHover={inStock ? { scale: 1.05 } : undefined}
              whileTap={inStock ? { scale: 0.88 } : undefined}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="flex size-[36px] items-center justify-center rounded-[8px] bg-ink text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-faint"
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex items-center justify-center"
                  >
                    <CheckIcon />
                  </motion.span>
                ) : (
                  <motion.span
                    key="cart"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex items-center justify-center"
                  >
                    <CartIcon />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.5 3h2l2.68 13.39a2 2 0 0 0 2 1.61h8.64a2 2 0 0 0 2-1.61L23 6H5.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function ImagePlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
