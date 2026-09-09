import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import CancelOrderButton from "@/components/CancelOrderButton";
import ReorderButton from "@/components/ReorderButton";
import { ImagePlaceholderIcon } from "@/components/ProductCard";
import { formatBaht } from "@/lib/demo-data";
import { getOrderById } from "@/lib/data/orders";

const paymentMethodLabel: Record<string, string> = {
  promptpay: "พร้อมเพย์ / PromptPay QR",
  credit_card: "บัตรเครดิต / เดบิต",
  cod: "ชำระเงินปลายทาง",
};

// หน้ารายละเอียดคำสั่งซื้อเดียว เข้าถึงผ่านปุ่ม "ดูรายละเอียด" ในหน้าประวัติคำสั่งซื้อ
// ปรับสไตล์ตาม Figma (โทเคน POS: border-subtle/bg-sunken/text-faint) เท่านั้น —
// logic การดึงข้อมูล/ยกเลิก/สั่งอีกครั้ง/ชำระเงินเดิมไม่ถูกแตะต้อง
export default async function OrderDetailPage(props: PageProps<"/account/orders/[id]">) {
  const { id } = await props.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await getOrderById(orderId);
  if (!order) notFound();

  const addressDetail = order.address
    ? [
        order.address.addressLine,
        order.address.subdistrict,
        order.address.district,
        order.address.province,
        order.address.postalCode,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-[14px] text-muted transition-colors hover:text-ink"
      >
        ← กลับไปประวัติคำสั่งซื้อ
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[16px] font-medium text-ink">คำสั่งซื้อ #{order.id}</p>
          <p className="mt-0.5 text-[12px] text-faint">{order.createdAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={order.status} />
          {order.status === "pending" && order.paymentMethod === "promptpay" && (
            <Link
              href={`/checkout/promptpay/${order.id}`}
              className="rounded-[10px] bg-ink px-4 py-2 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              ชำระเงิน
            </Link>
          )}
          {order.status === "pending" && <CancelOrderButton orderId={order.id} />}
          {order.status === "cancelled" && <ReorderButton orderId={order.id} />}
        </div>
      </div>

      {order.status === "cancelled" && order.cancelReason && (
        <section className="space-y-1 rounded-[14px] border border-[color:var(--color-status-cancelled)]/30 bg-sunken p-5">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-status-cancelled)]">
            เหตุผลที่ยกเลิก
          </h2>
          <p className="text-[14px] text-muted">{order.cancelReason}</p>
        </section>
      )}

      <section className="space-y-3 rounded-[14px] border border-subtle bg-sunken p-5">
        <h2 className="text-[14px] font-semibold text-ink">ที่อยู่จัดส่ง</h2>
        {order.address ? (
          <div className="text-[14px] text-muted">
            <p className="font-medium text-ink">
              {order.address.label || "ที่อยู่"}
              {order.address.recipientName && ` · ${order.address.recipientName}`}
              {order.address.phone && ` · ${order.address.phone}`}
            </p>
            {addressDetail && <p className="mt-1">{addressDetail}</p>}
          </div>
        ) : (
          <p className="text-[14px] text-muted">ไม่พบข้อมูลที่อยู่จัดส่ง</p>
        )}
      </section>

      <section className="space-y-3 rounded-[14px] border border-subtle bg-sunken p-5">
        <h2 className="text-[14px] font-semibold text-ink">วิธีการชำระเงิน</h2>
        <p className="text-[14px] text-muted">
          {order.paymentMethod
            ? paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod
            : "ยังไม่ระบุ"}
        </p>
      </section>

      <section className="space-y-4 rounded-[14px] border border-subtle bg-sunken p-5">
        <h2 className="text-[14px] font-semibold text-ink">รายการสินค้า</h2>
        <div className="divide-y divide-subtle border-y border-subtle">
          {order.items.map((item, index) => (
            <div key={`${item.productName}-${index}`} className="flex items-center gap-3 py-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-subtle text-faint">
                <ImagePlaceholderIcon />
              </div>
              <div className="flex-1">
                {item.productSlug ? (
                  <Link
                    href={`/product/${item.productSlug}`}
                    className="text-[14px] font-medium text-ink hover:underline"
                  >
                    {item.productName}
                  </Link>
                ) : (
                  <p className="text-[14px] font-medium text-ink">{item.productName}</p>
                )}
                <p className="text-[12px] text-faint">
                  {formatBaht(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="shrink-0 font-mono text-[14px] font-medium text-ink">
                {formatBaht(item.unitPrice * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-[14px] font-semibold text-ink">ยอดรวม</p>
          <p className="font-mono text-[16px] font-semibold text-ink">
            {formatBaht(order.totalAmount)}
          </p>
        </div>
      </section>
    </div>
  );
}
