"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import QuantityStepper from "@/components/QuantityStepper";
import { addToCartAction, buyNowAction, type CartActionState } from "@/lib/actions/cart";

const initialState: CartActionState = null;

export default function AddToCartForm({
  productId,
  stockQuantity,
}: {
  productId: number;
  stockQuantity: number;
}) {
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(addToCartAction, initialState);
  const [buyState, buyNowFormAction, isBuyPending] = useActionState(buyNowAction, initialState);
  const inStock = stockQuantity > 0;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={quantity} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <QuantityStepper max={Math.max(stockQuantity, 1)} onChange={setQuantity} />
        <motion.button
          type="submit"
          disabled={!inStock || isPending || isBuyPending}
          whileHover={inStock ? { scale: 1.03 } : undefined}
          whileTap={inStock ? { scale: 0.95 } : undefined}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
        </motion.button>
        <motion.button
          type="submit"
          formAction={buyNowFormAction}
          disabled={!inStock || isPending || isBuyPending}
          whileHover={inStock ? { scale: 1.03 } : undefined}
          whileTap={inStock ? { scale: 0.95 } : undefined}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBuyPending ? "กำลังไปหน้าชำระเงิน..." : "ซื้อทันที"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {(state?.error || buyState?.error) && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="rounded-lg border border-[color:var(--color-status-cancelled)]/30 bg-surface px-3.5 py-2.5 text-sm text-[color:var(--color-status-cancelled)]"
          >
            {state?.error || buyState?.error}
          </motion.p>
        )}
        {state?.success && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-[color:var(--color-status-delivered)]"
          >
            เพิ่มลงตะกร้าแล้ว — ดูตะกร้าได้ที่ไอคอนมุมขวาบน
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}
