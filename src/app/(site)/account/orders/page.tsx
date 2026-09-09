import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import CancelOrderButton from "@/components/CancelOrderButton";
import ReorderButton from "@/components/ReorderButton";
import { ImagePlaceholderIcon } from "@/components/ProductCard";
import { formatBaht, orderStatusLabel } from "@/lib/demo-data";
import { getOrders } from "@/lib/data/orders";

const FILTERS = [{ value: "all", label: "ทั้งหมด" } as const, ...Object.entries(orderStatusLabel).map(
  ([value, label]) => ({ value, label }) as const,
)];

// หน้าประวัติคำสั่งซื้อจริง: ดึงจาก Supabase ตรงๆ (Server Component, RLS จำกัดให้เห็นเฉพาะของตัวเอง)
// ปรับสไตล์ตาม Figma: เพิ่ม chip กรองสถานะ (ใช้ query param ?status= กรองฝั่ง server
// แทน useState เพื่อคงความเป็น Server Component เดิม) และการ์ดสรุปบัญชีด้านขวา — เป็นการ
// เพิ่ม UI ใหม่ ไม่กระทบ logic การดึงข้อมูล/ยกเลิก/สั่งอีกครั้งเดิมเลย
export default async function OrderHistoryPage(props: PageProps<"/account/orders">) {
  const searchParams = await props.searchParams;
  const justOrdered = searchParams?.success === "1";
  const statusParam = typeof searchParams?.status === "string" ? searchParams.status : "all";

  const orders = await getOrders();
  const filteredOrders =
    statusParam === "all" ? orders : orders.filter((o) => o.status === statusParam);

  const stats = {
    total: orders.length,
    totalSpent: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0),
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1 space-y-5">
        {justOrdered && (
          <div className="rounded-[10px] border border-[color:var(--color-status-delivered)]/30 bg-sunken p-4 text-sm text-[color:var(--color-status-delivered)]">
            สั่งซื้อสำเร็จ! เราได้รับคำสั่งซื้อของคุณแล้ว
          </div>
        )}

        <div>
          <p className="mb-3 text-[14px] text-muted">ทั้งหมด {filteredOrders.length} รายการ</p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = statusParam === f.value;
              const href =
                f.value === "all" ? "/account/orders" : `/account/orders?status=${f.value}`;
              return (
                <Link
                  key={f.value}
                  href={href}
                  className={`inline-flex h-[36px] items-center rounded-full px-4 text-[13px] font-medium transition ${
                    active
                      ? "bg-ink text-white"
                      : "border border-default bg-background text-muted hover:bg-sunken"
                  }`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="space-y-4 rounded-[14px] border border-subtle bg-sunken p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[16px] font-medium text-ink">คำสั่งซื้อ #{order.id}</p>
                  <p className="mt-0.5 text-[12px] text-faint">{order.createdAt}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="divide-y divide-subtle border-y border-subtle">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productName}-${index}`}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-subtle text-faint">
                      <ImagePlaceholderIcon />
                    </div>
                    <p className="text-[14px] text-muted">
                      {item.productName} × {item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[16px] font-medium text-ink">
                  {formatBaht(order.totalAmount)}
                </p>
                <div className="flex items-center gap-3">
                  {order.status === "pending" && <CancelOrderButton orderId={order.id} />}
                  {order.status === "cancelled" && <ReorderButton orderId={order.id} />}
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="rounded-[10px] border border-default bg-background px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-sunken"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <p className="py-10 text-center text-[14px] text-muted">
              {orders.length === 0 ? "ยังไม่มีประวัติคำสั่งซื้อ" : "ไม่มีคำสั่งซื้อในสถานะนี้"}
            </p>
          )}
        </div>
      </div>

      <div className="w-full shrink-0 lg:w-[300px]">
        <div className="rounded-[14px] border border-subtle bg-sunken p-5">
          <h3 className="mb-5 text-[14px] font-medium text-ink">สรุปบัญชี</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-muted">คำสั่งซื้อทั้งหมด</p>
              <p className="text-[16px] font-medium text-ink">{stats.total} รายการ</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-muted">ยอดใช้จ่ายสะสม</p>
              <p className="text-[16px] font-medium text-ink">
                {formatBaht(stats.totalSpent)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[14px] text-muted">คำสั่งซื้อที่ยกเลิก</p>
              <p className="text-[16px] font-medium text-ink">
                {stats.cancelled} รายการ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
