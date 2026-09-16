"use client";

import { useActionState, useState } from "react";
import { updateOrderStatusAction, type AdminActionState } from "@/lib/actions/admin-orders";
import { orderStatusLabel, type OrderStatus } from "@/lib/demo-data";

const initialState: AdminActionState = null;
const STATUS_OPTIONS = Object.keys(orderStatusLabel) as OrderStatus[];

export default function OrderStatusForm({ orderId, status }: { orderId: number; status: OrderStatus }) {
  const [state, formAction, isPending] = useActionState(updateOrderStatusAction, initialState);
  const [selected, setSelected] = useState(status);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={orderId} />
      <div className="flex items-center gap-2">
        <select
          name="order_status"
          value={selected}
          onChange={(e) => setSelected(e.target.value as OrderStatus)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {orderStatusLabel[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending || selected === status}
          className="h-10 rounded-lg bg-ink px-4 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "กำลังบันทึก..." : "เปลี่ยนสถานะ"}
        </button>
      </div>
      {state?.error && <p className="text-xs text-[color:var(--color-status-cancelled)]">{state.error}</p>}
      {state?.success && <p className="text-xs text-[color:var(--color-status-delivered)]">บันทึกสถานะแล้ว</p>}
    </form>
  );
}
