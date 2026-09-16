import Link from "next/link";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { formatBaht } from "@/lib/demo-data";
import { getAdminOrderDetail } from "@/lib/data/admin-orders";

// หน้ารายละเอียดออเดอร์ — ขั้นตอนที่ 7: สินค้า/ที่อยู่/ลูกค้า/การชำระเงิน + เปลี่ยนสถานะ
export default async function AdminOrderDetailPage(props: PageProps<"/admin/orders/[id]">) {
  const { id } = await props.params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();

  const order = await getAdminOrderDetail(orderId);
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-xs font-medium text-muted hover:text-ink hover:underline">
            ← กลับไปรายการออเดอร์
          </Link>
          <h2 className="mt-1 text-lg font-semibold text-ink">ออเดอร์ #{order.id}</h2>
        </div>
        <Link
          href={`/admin/orders/${order.id}/receipt`}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
        >
          พิมพ์ใบเสร็จ
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-background p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">รายการสินค้า</h3>
            <StatusBadge status={order.status} />
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">สินค้า</th>
                <th className="py-2 pr-4 font-medium">จำนวน</th>
                <th className="py-2 pr-4 font-medium">ราคา/ชิ้น</th>
                <th className="py-2 font-medium text-right">รวม</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.productId} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4 text-ink">{item.productName}</td>
                  <td className="py-3 pr-4 text-ink">{item.quantity}</td>
                  <td className="py-3 pr-4 font-mono text-ink">{formatBaht(item.unitPrice)}</td>
                  <td className="py-3 text-right font-mono text-ink">
                    {formatBaht(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end border-t border-border pt-4">
            <p className="text-sm font-semibold text-ink">
              ยอดรวม: <span className="font-mono">{formatBaht(order.totalAmount)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="mb-3 text-sm font-semibold text-ink">เปลี่ยนสถานะออเดอร์</h3>
            <OrderStatusForm orderId={order.id} status={order.status} />
            {order.cancelReason && (
              <p className="mt-3 rounded-lg bg-sunken px-3 py-2 text-xs text-muted">
                เหตุผลยกเลิก: {order.cancelReason}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="mb-3 text-sm font-semibold text-ink">ข้อมูลลูกค้า</h3>
            <dl className="flex flex-col gap-2 text-sm">
              <div>
                <dt className="text-xs text-muted">ชื่อผู้ใช้</dt>
                <dd className="text-ink">{order.customer.name ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">อีเมล</dt>
                <dd className="text-ink">{order.customer.email ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">เบอร์โทร</dt>
                <dd className="text-ink">{order.customer.phone ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="mb-3 text-sm font-semibold text-ink">ที่อยู่จัดส่ง</h3>
            {order.address ? (
              <div className="text-sm text-ink">
                <p>{order.address.recipientName}</p>
                <p className="text-muted">{order.address.phone}</p>
                <p className="mt-1 text-muted">
                  {order.address.addressLine} {order.address.subdistrict} {order.address.district}{" "}
                  {order.address.province} {order.address.postalCode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">ไม่มีข้อมูลที่อยู่</p>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="mb-3 text-sm font-semibold text-ink">การชำระเงิน</h3>
            {order.payment ? (
              <dl className="flex flex-col gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted">ช่องทาง</dt>
                  <dd className="text-ink">{order.payment.method ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">สถานะการชำระเงิน</dt>
                  <dd className="text-ink">{order.payment.status ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">ชำระเมื่อ</dt>
                  <dd className="text-ink">
                    {order.payment.paidAt
                      ? new Date(order.payment.paidAt).toLocaleString("th-TH")
                      : "ยังไม่ชำระ"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted">ยังไม่มีข้อมูลการชำระเงิน</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
