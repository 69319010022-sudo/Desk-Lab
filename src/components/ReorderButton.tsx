"use client";

import { useState, useTransition } from "react";
import { reorderAction } from "@/lib/actions/orders";

// ปรับสไตล์ตาม Figma (POS) เท่านั้น — logic reorderAction เดิมไม่ถูกแตะต้อง
export default function ReorderButton({ orderId }: { orderId: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await reorderAction(orderId);
            if (result?.error) setError(result.error);
          });
        }}
        className="rounded-[10px] bg-ink px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "กำลังเพิ่มสินค้า..." : "สั่งซื้อใหม่อีกครั้ง"}
      </button>
      {error && <p className="text-xs text-[color:var(--color-status-cancelled)]">{error}</p>}
    </div>
  );
}
