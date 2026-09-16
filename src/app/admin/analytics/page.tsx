import SalesBarChart from "@/components/admin/SalesBarChart";
import { formatBaht } from "@/lib/demo-data";
import { getSalesOverTime, getTopProducts, getTopCustomers } from "@/lib/data/admin-analytics";

// หน้า Analytics — ขั้นตอนที่ 8 (ขั้นตอนสุดท้าย): ยอดขายตามช่วงเวลา, สินค้าขายดี, ลูกค้า
// นิยามตัวเลขทั้งหมดใช้ VALID_SALES_STATUSES เดียวกับ dashboard (ดู admin-analytics.ts)
export default async function AdminAnalyticsPage() {
  const [salesOverTime, topProducts, topCustomers] = await Promise.all([
    getSalesOverTime(14),
    getTopProducts(10),
    getTopCustomers(10),
  ]);

  const totalSales14d = salesOverTime.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">ยอดขาย 14 วันล่าสุด</h2>
          <p className="text-sm text-muted">
            รวม <span className="font-mono font-semibold text-ink">{formatBaht(totalSales14d)}</span>
          </p>
        </div>
        <SalesBarChart data={salesOverTime} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">สินค้าขายดี (top 10)</h2>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">ยังไม่มีข้อมูลยอดขาย</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4 font-medium">สินค้า</th>
                  <th className="py-2 pr-4 font-medium">จำนวนขาย</th>
                  <th className="py-2 text-right font-medium">รายได้</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.productId} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4 text-ink">{p.name}</td>
                    <td className="py-2.5 pr-4 font-mono text-ink">{p.quantitySold}</td>
                    <td className="py-2.5 text-right font-mono text-ink">{formatBaht(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-background p-6">
          <h2 className="mb-4 text-sm font-semibold text-ink">ลูกค้า (top 10 ตามยอดใช้จ่าย)</h2>
          {topCustomers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">ยังไม่มีข้อมูลลูกค้า</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-4 font-medium">ลูกค้า</th>
                  <th className="py-2 pr-4 font-medium">ออเดอร์</th>
                  <th className="py-2 text-right font-medium">ยอดใช้จ่ายรวม</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c) => (
                  <tr key={c.userId} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4">
                      <p className="text-ink">{c.name}</p>
                      <p className="text-xs text-muted">{c.email}</p>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-ink">{c.orderCount}</td>
                    <td className="py-2.5 text-right font-mono text-ink">{formatBaht(c.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
