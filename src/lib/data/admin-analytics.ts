import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/demo-data";

// ไฟล์นี้ดึงข้อมูลสำหรับหน้า Admin Analytics (ขั้นตอนที่ 8 — ขั้นตอนสุดท้าย) ต่อ Supabase
// จริง ใช้ VALID_SALES_STATUSES เดียวกับ admin-dashboard.ts เสมอ (paid/processing/shipped/
// delivered — ไม่นับ pending/cancelled) เพื่อให้ตัวเลขสอดคล้องกันทั้งแอดมิน

const VALID_SALES_STATUSES: OrderStatus[] = ["paid", "processing", "shipped", "delivered"];

function isValidSalesStatus(status: string): status is OrderStatus {
  return (VALID_SALES_STATUSES as string[]).includes(status);
}

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

export type DailySales = { date: string; label: string; sales: number; orderCount: number };
export type TopProduct = {
  productId: number;
  name: string;
  quantitySold: number;
  revenue: number;
  imageUrl: string | null;
};
export type TopCustomer = { userId: string; name: string; email: string; totalSpent: number; orderCount: number };

const THAI_WEEKDAY_LABELS = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];

// ยอดขายรายวันของสัปดาห์ปัจจุบัน (จันทร์ - อาทิตย์ ของสัปดาห์นี้) สำหรับกราฟเส้นที่หน้า Dashboard
// ต่างจาก getSalesOverTime ที่นับ "N วันล่าสุดนับถอยหลังจากวันนี้" — ฟังก์ชันนี้ยึดสัปดาห์ปฏิทิน
export async function getSalesThisWeek(): Promise<DailySales[]> {
  try {
    const supabase = await createClient();

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    // getDay(): อาทิตย์ = 0 ... เสาร์ = 6 — เลื่อนให้จันทร์เป็นวันแรกของสัปดาห์
    const dayOffset = (startOfToday.getDay() + 6) % 7;
    const monday = new Date(startOfToday);
    monday.setDate(startOfToday.getDate() - dayOffset);

    const { data, error } = await supabase
      .from("orders")
      .select("order_status, total_amount, created_at")
      .gte("created_at", monday.toISOString());

    if (error) {
      console.error("getSalesThisWeek error:", error.message);
      return [];
    }

    const byDate = new Map<string, { sales: number; orderCount: number }>();
    for (const row of data ?? []) {
      if (!isValidSalesStatus(row.order_status)) continue;
      const dateKey = new Date(row.created_at).toISOString().slice(0, 10);
      const bucket = byDate.get(dateKey) ?? { sales: 0, orderCount: 0 };
      bucket.sales += Number(row.total_amount ?? 0);
      bucket.orderCount += 1;
      byDate.set(dateKey, bucket);
    }

    const result: DailySales[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const bucket = byDate.get(dateKey) ?? { sales: 0, orderCount: 0 };
      result.push({
        date: dateKey,
        label: THAI_WEEKDAY_LABELS[i],
        sales: bucket.sales,
        orderCount: bucket.orderCount,
      });
    }
    return result;
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getSalesThisWeek failed:", err);
    return [];
  }
}

export async function getSalesOverTime(days = 14): Promise<DailySales[]> {
  try {
    const supabase = await createClient();

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const { data, error } = await supabase
      .from("orders")
      .select("order_status, total_amount, created_at")
      .gte("created_at", start.toISOString());

    if (error) {
      console.error("getSalesOverTime error:", error.message);
      return [];
    }

    const byDate = new Map<string, { sales: number; orderCount: number }>();
    for (const row of data ?? []) {
      if (!isValidSalesStatus(row.order_status)) continue;
      const dateKey = new Date(row.created_at).toISOString().slice(0, 10);
      const bucket = byDate.get(dateKey) ?? { sales: 0, orderCount: 0 };
      bucket.sales += Number(row.total_amount ?? 0);
      bucket.orderCount += 1;
      byDate.set(dateKey, bucket);
    }

    const result: DailySales[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const bucket = byDate.get(dateKey) ?? { sales: 0, orderCount: 0 };
      result.push({
        date: dateKey,
        label: d.toLocaleDateString("th-TH", { day: "2-digit", month: "short" }),
        sales: bucket.sales,
        orderCount: bucket.orderCount,
      });
    }
    return result;
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getSalesOverTime failed:", err);
    return [];
  }
}

type OrderItemRow = {
  product_id: number;
  quantity: number;
  unit_price: number;
  products:
    | { name: string; product_images: { image_url: string; sort_order: number }[] | null }
    | { name: string; product_images: { image_url: string; sort_order: number }[] | null }[]
    | null;
  orders: { order_status: string } | { order_status: string }[] | null;
};

export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price, products(name, product_images(image_url, sort_order)), orders(order_status)");

    if (error) {
      console.error("getTopProducts error:", error.message);
      return [];
    }

    const map = new Map<number, TopProduct>();
    for (const item of (data ?? []) as OrderItemRow[]) {
      const status = firstOf(item.orders)?.order_status;
      if (!status || !isValidSalesStatus(status)) continue;

      const product = firstOf(item.products);
      const name = product?.name ?? "สินค้าที่ถูกลบ";
      const images = [...(product?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      const imageUrl = images[0]?.image_url ?? null;
      const revenue = item.quantity * Number(item.unit_price);
      const existing = map.get(item.product_id);
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenue += revenue;
      } else {
        map.set(item.product_id, {
          productId: item.product_id,
          name,
          quantitySold: item.quantity,
          revenue,
          imageUrl,
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getTopProducts failed:", err);
    return [];
  }
}

type CustomerOrderRow = {
  user_id: string;
  order_status: string;
  total_amount: number | null;
  users: { name: string | null; email: string | null } | { name: string | null; email: string | null }[] | null;
};

export async function getTopCustomers(limit = 10): Promise<TopCustomer[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("user_id, order_status, total_amount, users(name, email)");

    if (error) {
      console.error("getTopCustomers error:", error.message);
      return [];
    }

    const map = new Map<string, TopCustomer>();
    for (const order of (data ?? []) as CustomerOrderRow[]) {
      if (!isValidSalesStatus(order.order_status)) continue;

      const user = firstOf(order.users);
      const amount = Number(order.total_amount ?? 0);
      const existing = map.get(order.user_id);
      if (existing) {
        existing.totalSpent += amount;
        existing.orderCount += 1;
      } else {
        map.set(order.user_id, {
          userId: order.user_id,
          name: user?.name ?? "ไม่ทราบชื่อ",
          email: user?.email ?? "-",
          totalSpent: amount,
          orderCount: 1,
        });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, limit);
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getTopCustomers failed:", err);
    return [];
  }
}
