import { createClient } from "@/lib/supabase/server";
import { type OrderStatus } from "@/lib/demo-data";

// ไฟล์นี้ดึงข้อมูลสรุปสำหรับหน้า Admin Dashboard (ขั้นตอนที่ 5) — ต่อ Supabase จริง
// เรียกได้เฉพาะจากบัญชีที่ role = 'admin' เท่านั้น (พึ่ง RLS policy admin ที่เปิดไว้ตั้งแต่
// ขั้นตอนที่ 3: orders_admin_select, order_items_admin_select, users_admin_select,
// products_admin_all) — ถ้าเรียกจากบัญชีที่ไม่ใช่แอดมิน RLS จะคืนแถวว่างให้เองไม่ error
// ใช้ได้เฉพาะใน Server Component เท่านั้น (createClient เป็น async อ่าน cookies)

// นิยามตัวเลขแต่ละตัว (บันทึกไว้คู่กับ desklab-plan.md ขั้นตอนที่ 5):
// - VALID_SALES_STATUSES: นับเป็นยอดขายจริง (paid/processing/shipped/delivered) ไม่นับ
//   pending (ยังไม่ชำระ) และ cancelled (ยกเลิกแล้ว)
// - ยอดขายวันนี้ / จำนวนออเดอร์วันนี้: กรองด้วย created_at ของวันนี้ (เวลาเครื่อง server)
//   ยอดขายนับเฉพาะ VALID_SALES_STATUSES แต่จำนวนออเดอร์นับทุกสถานะ (สะท้อนปริมาณสั่งซื้อจริง)
// - ออเดอร์รอจัดส่ง: นับสถานะ processing ทั้งหมด (all-time) — ตรงกับ label เดิม "รอจัดส่ง"
//   ที่ผูกกับสถานะ processing อยู่แล้วใน orderStatusLabel (demo-data.ts)
// - AOV: ค่าเฉลี่ย total_amount ของออเดอร์ที่อยู่ใน VALID_SALES_STATUSES ทั้งหมด (all-time)
// - เทียบ trend (% เทียบช่วงก่อนหน้า): ยอดขาย/จำนวนออเดอร์เทียบ "เมื่อวาน", AOV เทียบ AOV
//   สะสมของทุกวันก่อนหน้า (ไม่รวมวันนี้) — เป็น null ถ้าฐานเทียบเป็น 0 (เทียบไม่ได้)

const VALID_SALES_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];

function isValidSalesStatus(status: string): status is OrderStatus {
  return (VALID_SALES_STATUSES as string[]).includes(status);
}

// Next.js ใช้ error แบบพิเศษภายในตัวเอง (เช่นตอนตรวจพบว่าหน้านี้ต้องเป็น dynamic) —
// ห้ามกลืน ต้อง throw ต่อให้ Next.js จัดการเอง (แพทเทิร์นเดียวกับ catalog.ts)
function rethrowIfNextInternal(err: unknown): void {
  if (err && typeof err === "object" && "digest" in err) {
    const digest = String((err as { digest?: unknown }).digest ?? "");
    if (digest.startsWith("DYNAMIC_SERVER_USAGE") || digest.startsWith("NEXT_")) {
      throw err;
    }
  }
}

function firstOf<T>(rel: T | T[] | null): T | null {
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

// คืน % เปลี่ยนแปลงเทียบฐานเดิม ปัดเป็นทศนิยม 1 ตำแหน่ง — คืน null ถ้าฐานเป็น 0 (เทียบไม่ได้จริง)
function computeTrendPercent(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export type RecentOrder = {
  id: number;
  customerName: string;
  itemsSummary: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

export type DashboardStats = {
  todaySales: number;
  todaySalesTrend: number | null;
  todayOrderCount: number;
  todayOrderCountTrend: number | null;
  pendingShipmentCount: number;
  averageOrderValue: number;
  averageOrderValueTrend: number | null;
  totalOrderCount: number;
  recentOrders: RecentOrder[];
};

const EMPTY_STATS: DashboardStats = {
  todaySales: 0,
  todaySalesTrend: null,
  todayOrderCount: 0,
  todayOrderCountTrend: null,
  pendingShipmentCount: 0,
  averageOrderValue: 0,
  averageOrderValueTrend: null,
  totalOrderCount: 0,
  recentOrders: [],
};

type OrderRow = {
  id: number;
  order_status: string;
  total_amount: number | null;
  created_at: string;
};

type RecentOrderRow = OrderRow & {
  users: { name: string | null } | { name: string | null }[] | null;
  order_items: { quantity: number; products: { name: string } | { name: string }[] | null }[] | null;
};

function buildItemsSummary(items: RecentOrderRow["order_items"]): string {
  const list = items ?? [];
  if (list.length === 0) return "-";
  return list.map((item) => `${firstOf(item.products)?.name ?? "สินค้าที่ถูกลบ"} x${item.quantity}`).join(", ");
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const supabase = await createClient();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);
    const startOfYesterdayIso = startOfYesterday.toISOString();

    const [ordersRes, recentOrdersRes] = await Promise.all([
      supabase.from("orders").select("id, order_status, total_amount, created_at"),
      supabase
        .from("orders")
        .select("id, order_status, total_amount, created_at, users(name), order_items(quantity, products(name))")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    if (ordersRes.error) {
      console.error("getDashboardStats orders error:", ordersRes.error.message);
      return EMPTY_STATS;
    }

    const allOrders = (ordersRes.data ?? []) as OrderRow[];

    let todaySales = 0;
    let todayOrderCount = 0;
    let yesterdaySales = 0;
    let yesterdayOrderCount = 0;
    let pendingShipmentCount = 0;
    let salesSum = 0;
    let salesCount = 0;
    let salesSumBeforeToday = 0;
    let salesCountBeforeToday = 0;

    for (const order of allOrders) {
      const total = Number(order.total_amount ?? 0);
      const isToday = order.created_at >= startOfTodayIso;
      const isYesterday = !isToday && order.created_at >= startOfYesterdayIso;
      const isSales = isValidSalesStatus(order.order_status);

      if (isToday) {
        todayOrderCount += 1;
        if (isSales) todaySales += total;
      }
      if (isYesterday) {
        yesterdayOrderCount += 1;
        if (isSales) yesterdaySales += total;
      }
      if (order.order_status === "processing") pendingShipmentCount += 1;
      if (isSales) {
        salesSum += total;
        salesCount += 1;
        if (!isToday) {
          salesSumBeforeToday += total;
          salesCountBeforeToday += 1;
        }
      }
    }

    const averageOrderValue = salesCount > 0 ? salesSum / salesCount : 0;

    const todaySalesValidCount = allOrders.filter(
      (o) => o.created_at >= startOfTodayIso && isValidSalesStatus(o.order_status),
    ).length;
    const todayAverageOrderValue = todaySalesValidCount > 0 ? todaySales / todaySalesValidCount : 0;
    const averageOrderValueBeforeToday = salesCountBeforeToday > 0 ? salesSumBeforeToday / salesCountBeforeToday : 0;

    let recentOrders: RecentOrder[] = [];
    if (recentOrdersRes.error) {
      console.error("getDashboardStats recentOrders error:", recentOrdersRes.error.message);
    } else {
      recentOrders = ((recentOrdersRes.data ?? []) as RecentOrderRow[]).map((row) => ({
        id: row.id,
        customerName: firstOf(row.users)?.name ?? "ไม่ทราบชื่อ",
        itemsSummary: buildItemsSummary(row.order_items),
        totalAmount: Number(row.total_amount ?? 0),
        status: row.order_status as OrderStatus,
        createdAt: row.created_at,
      }));
    }

    return {
      todaySales,
      todaySalesTrend: computeTrendPercent(todaySales, yesterdaySales),
      todayOrderCount,
      todayOrderCountTrend: computeTrendPercent(todayOrderCount, yesterdayOrderCount),
      pendingShipmentCount,
      averageOrderValue,
      averageOrderValueTrend:
        todaySalesValidCount > 0 ? computeTrendPercent(todayAverageOrderValue, averageOrderValueBeforeToday) : null,
      totalOrderCount: allOrders.length,
      recentOrders,
    };
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getDashboardStats failed:", err);
    return EMPTY_STATS;
  }
}
