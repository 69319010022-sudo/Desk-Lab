import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { formatBaht } from "@/lib/demo-data";
import { getAdminOrders } from "@/lib/data/admin-orders";

// หน้าจัดการคำสั่งซื้อ — ขั้นตอนที่ 7: รายการออเดอร์ทั้งหมดต่อ Supabase จริง
export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">ออเดอร์ทั้งหมด ({orders.length})</h2>

      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">ยังไม่มีออเดอร์ในระบบ</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">เลขออเดอร์</th>
                <th className="py-2 pr-4 font-medium">ลูกค้า</th>
                <th className="py-2 pr-4 font-medium">ยอดรวม</th>
                <th className="py-2 pr-4 font-medium">สถานะ</th>
                <th className="py-2 font-medium">วันที่</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono text-ink hover:underline">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-ink">{order.customerName}</td>
                  <td className="py-3 pr-4 font-mono text-ink">{formatBaht(order.totalAmount)}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="py-3 text-muted">
                    {new Date(order.createdAt).toLocaleDateString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
