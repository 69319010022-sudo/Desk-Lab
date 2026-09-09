import { OrderStatus, orderStatusLabel } from "@/lib/demo-data";

const styles: Record<OrderStatus, string> = {
  pending: "bg-[color:var(--color-status-pending-bg)] text-[color:var(--color-status-pending)]",
  paid: "bg-[color:var(--color-status-paid-bg)] text-[color:var(--color-status-paid)]",
  processing:
    "bg-[color:var(--color-status-processing-bg)] text-[color:var(--color-status-processing)]",
  shipped: "bg-[color:var(--color-status-shipped-bg)] text-[color:var(--color-status-shipped)]",
  delivered:
    "bg-[color:var(--color-status-delivered-bg)] text-[color:var(--color-status-delivered)]",
  cancelled:
    "bg-[color:var(--color-status-cancelled-bg)] text-[color:var(--color-status-cancelled)]",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {orderStatusLabel[status]}
    </span>
  );
}
