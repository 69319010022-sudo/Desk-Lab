import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import { formatBaht, orderStatusLabel } from "@/lib/demo-data";
import { getAdminOrderDetail } from "@/lib/data/admin-orders";

// หน้าใบเสร็จพิมพ์ได้ — ขั้นตอนที่ 7 (ส่วนสุดท้าย) — ไม่ทำ PDF export รอบนี้ ใช้
// window.print() ของเบราว์เซอร์ตรงๆ (Sidebar/TopBar ของ layout ถูกซ่อนด้วย print:hidden แล้ว)
export default async function AdminOrderReceiptPage(props: PageProps<"/admin/orders/[id]/receipt">) {
  const { id } = await props.params;
  const orderId = Number(id);
  if (!Number.isFinite(orderId)) notFound();

  const order = await getAdminOrderDetail(orderId);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex justify-end">
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-border bg-background p-8 print:rounded-none print:border-0">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-6">
          <div>
            <h1 className="text-xl font-bold text-ink">DeskLab</h1>
            <p className="text-sm text-muted">ใบเสร็จรับเงิน / Receipt</p>
          </div>
          <div className="text-right text-sm text-muted">
            <p>เลขที่ออเดอร์: #{order.id}</p>
            <p>
              วันที่: {new Date(order.createdAt).toLocaleDateString("th-TH", { dateStyle: "long" })}
            </p>
            <p>สถานะ: {orderStatusLabel[order.status]}</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted">ลูกค้า</p>
            <p className="text-ink">{order.customer.name ?? "-"}</p>
            <p className="text-muted">{order.customer.email ?? "-"}</p>
            <p className="text-muted">{order.customer.phone ?? "-"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-muted">ที่อยู่จัดส่ง</p>
            {order.address ? (
              <>
                <p className="text-ink">{order.address.recipientName}</p>
                <p className="text-muted">{order.address.phone}</p>
                <p className="text-muted">
                  {order.address.addressLine} {order.address.subdistrict} {order.address.district}{" "}
                  {order.address.province} {order.address.postalCode}
                </p>
              </>
            ) : (
              <p className="text-muted">-</p>
            )}
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-4 font-medium">สินค้า</th>
              <th className="py-2 pr-4 font-medium">จำนวน</th>
              <th className="py-2 pr-4 font-medium">ราคา/ชิ้น</th>
              <th className="py-2 text-right font-medium">รวม</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b border-border/60 last:border-0">
                <td className="py-2 pr-4 text-ink">{item.productName}</td>
                <td className="py-2 pr-4 text-ink">{item.quantity}</td>
                <td className="py-2 pr-4 font-mono text-ink">{formatBaht(item.unitPrice)}</td>
                <td className="py-2 text-right font-mono text-ink">
                  {formatBaht(item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <p className="text-base font-semibold text-ink">
            ยอดรวมสุทธิ: <span className="font-mono">{formatBaht(order.totalAmount)}</span>
          </p>
        </div>

        {order.payment && (
          <p className="mt-4 text-xs text-muted">
            ชำระผ่าน {order.payment.method ?? "-"} — สถานะ {order.payment.status ?? "-"}
          </p>
        )}
      </div>
    </div>
  );
}
