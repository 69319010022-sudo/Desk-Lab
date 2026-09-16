import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import TrendBadge from "@/components/admin/TrendBadge";
import WeeklySalesLineChart from "@/components/admin/WeeklySalesLineChart";
import { formatBaht } from "@/lib/demo-data";
import { getDashboardStats } from "@/lib/data/admin-dashboard";
import { getLowStockProducts, getProductsSummary } from "@/lib/data/admin-catalog";
import { getSalesThisWeek, getTopProducts } from "@/lib/data/admin-analytics";

// หน้าแดชบอร์ด — ขั้นตอนที่ 5: ต่อข้อมูลจริงจาก Supabase แล้ว
// เลย์เอาต์อิงตามภาพตัวอย่างที่ผู้ใช้ส่งมา: การ์ด KPI พร้อม trend ด้านบน, กราฟยอดขาย +
// ตารางออเดอร์ล่าสุดฝั่งซ้าย, สินค้าใกล้หมดสต็อก + สินค้าขายดีฝั่งขวา
// นิยามตัวเลขแต่ละตัวดูรายละเอียดที่ src/lib/data/admin-dashboard.ts และ desklab-plan.md

function KpiCard({
  label,
  value,
  trend,
  tag,
  hint,
}: {
  label: string;
  value: string;
  trend?: number | null;
  tag?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        {typeof trend === "number" && <TrendBadge percent={trend} />}
        {tag && (
          <span className="inline-flex items-center rounded-full bg-[color:var(--color-status-processing-bg)] px-2 py-0.5 text-xs font-semibold text-[color:var(--color-status-processing)]">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-2 font-mono text-[26px] font-semibold leading-none text-ink">{value}</p>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, productsSummary, salesThisWeek, bestSellers, lowStockProducts] = await Promise.all([
    getDashboardStats(),
    getProductsSummary(),
    getSalesThisWeek(),
    getTopProducts(5),
    getLowStockProducts(5),
  ]);

  const totalSalesThisWeek = salesThisWeek.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="ยอดขายวันนี้"
          value={formatBaht(stats.todaySales)}
          trend={stats.todaySalesTrend}
          hint="นับเฉพาะออเดอร์ที่ชำระเงินแล้ว"
        />
        <KpiCard
          label="จำนวนออเดอร์วันนี้"
          value={`${stats.todayOrderCount.toLocaleString("th-TH")} ออเดอร์`}
          trend={stats.todayOrderCountTrend}
        />
        <KpiCard
          label="ออเดอร์รอจัดส่ง"
          value={`${stats.pendingShipmentCount.toLocaleString("th-TH")} ออเดอร์`}
          tag="รอจัดส่ง"
        />
        <KpiCard
          label="มูลค่าเฉลี่ยต่อออเดอร์ (AOV)"
          value={formatBaht(Math.round(stats.averageOrderValue))}
          trend={stats.averageOrderValueTrend}
          hint="เฉลี่ยจากออเดอร์ที่ชำระเงินแล้วทั้งหมด"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="flex flex-col gap-6 xl:col-span-2">
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-1 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-ink">ยอดขายสัปดาห์นี้</h2>
                <p className="text-xs text-muted">(บาท - รายวัน, จันทร์ - อาทิตย์)</p>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <span className="h-2 w-2 rounded-full bg-ink" />
                ยอดรวม {formatBaht(totalSalesThisWeek)}
              </p>
            </div>
            <WeeklySalesLineChart data={salesThisWeek} />
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">รายการคำสั่งซื้อล่าสุด</h2>
              <Link href="/admin/orders" className="text-xs font-medium text-muted transition hover:text-ink">
                ดูทั้งหมด
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">ยังไม่มีออเดอร์ในระบบ</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      <th className="py-2 pr-4 font-medium">เลขออเดอร์</th>
                      <th className="py-2 pr-4 font-medium">ลูกค้า</th>
                      <th className="py-2 pr-4 font-medium">รายการสินค้า</th>
                      <th className="py-2 pr-4 font-medium">ยอดรวม</th>
                      <th className="py-2 pr-4 font-medium">สถานะ</th>
                      <th className="py-2 font-medium">วันที่</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-border/60 last:border-0">
                        <td className="py-3 pr-4">
                          <Link href={`/admin/orders/${order.id}`} className="font-mono text-ink hover:underline">
                            #{order.id}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-ink">{order.customerName}</td>
                        <td className="max-w-[220px] truncate py-3 pr-4 text-muted" title={order.itemsSummary}>
                          {order.itemsSummary}
                        </td>
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
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">สินค้าใกล้หมดสต็อก</h2>
              <Link href="/admin/products" className="text-xs font-medium text-muted transition hover:text-ink">
                จัดการสต็อก
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">ไม่มีสินค้าใกล้หมดสต็อกในตอนนี้</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-border bg-sunken" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{product.name}</p>
                      <p className="font-mono text-xs text-muted">{product.sku}</p>
                    </div>
                    <span
                      className={
                        product.stockQuantity === 0
                          ? "shrink-0 rounded-full bg-[color:var(--color-status-cancelled-bg)] px-2 py-0.5 text-xs font-semibold text-[color:var(--color-status-cancelled)]"
                          : "shrink-0 rounded-full bg-[color:var(--color-status-processing-bg)] px-2 py-0.5 text-xs font-semibold text-[color:var(--color-status-processing)]"
                      }
                    >
                      {product.stockQuantity === 0 ? "หมดสต็อก" : `เหลือ ${product.stockQuantity} ชิ้น`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">สินค้าขายดี</h2>
              <Link href="/admin/analytics" className="text-xs font-medium text-muted transition hover:text-ink">
                ดูทั้งหมด
              </Link>
            </div>

            {bestSellers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">ยังไม่มีข้อมูลยอดขาย</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {bestSellers.map((product, index) => (
                  <li key={product.productId} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sunken text-xs font-semibold text-muted">
                      {index + 1}
                    </span>
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-border bg-sunken" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{product.name}</p>
                      <p className="text-xs text-muted">{product.quantitySold} ชิ้น</p>
                    </div>
                    <span className="shrink-0 font-mono text-sm text-ink">{formatBaht(product.revenue)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <h2 className="mb-3 text-sm font-semibold text-ink">สินค้า</h2>
            <dl className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-sm text-muted">จำนวนสินค้าทั้งหมด</dt>
                <dd className="font-mono text-sm font-semibold text-ink">
                  {productsSummary.totalCount.toLocaleString("th-TH")} รายการ
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-sm text-muted">สินค้าหมดสต็อก</dt>
                <dd className="font-mono text-sm font-semibold text-ink">
                  {productsSummary.outOfStockCount.toLocaleString("th-TH")} รายการ
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
