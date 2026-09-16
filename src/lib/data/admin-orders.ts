import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/demo-data";

// ไฟล์นี้ดึงข้อมูลออเดอร์สำหรับหน้า Admin Order Management (ขั้นตอนที่ 7) — ต่อ Supabase
// จริง เรียกได้เฉพาะบัญชี role='admin' (พึ่ง policy orders_admin_select, order_items_admin_select,
// payments_admin_select, users_admin_select, addresses_admin_select ที่เปิดไว้ขั้นตอนที่ 3)

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

export type AdminOrderSummary = {
  id: number;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

export type AdminOrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrderAddress = {
  recipientName: string | null;
  phone: string | null;
  addressLine: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  postalCode: string | null;
};

export type AdminOrderDetail = {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  cancelReason: string | null;
  customer: { name: string | null; email: string | null; phone: string | null };
  address: AdminOrderAddress | null;
  items: AdminOrderItem[];
  payment: { method: string | null; status: string | null; paidAt: string | null } | null;
};

type OrderSummaryRow = {
  id: number;
  order_status: string;
  total_amount: number | null;
  created_at: string;
  users: { name: string | null } | { name: string | null }[] | null;
};

export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("id, order_status, total_amount, created_at, users(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getAdminOrders error:", error.message);
      return [];
    }

    return (data as OrderSummaryRow[]).map((row) => ({
      id: row.id,
      customerName: firstOf(row.users)?.name ?? "ไม่ทราบชื่อ",
      totalAmount: Number(row.total_amount ?? 0),
      status: row.order_status as OrderStatus,
      createdAt: row.created_at,
    }));
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getAdminOrders failed:", err);
    return [];
  }
}

type OrderDetailRow = {
  id: number;
  order_status: string;
  total_amount: number | null;
  created_at: string;
  cancel_reason: string | null;
  users: { name: string | null; email: string | null; phone: string | null } | { name: string | null; email: string | null; phone: string | null }[] | null;
  addresses:
    | {
        recipient_name: string | null;
        phone: string | null;
        address_line: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postal_code: string | null;
      }
    | Array<{
        recipient_name: string | null;
        phone: string | null;
        address_line: string | null;
        subdistrict: string | null;
        district: string | null;
        province: string | null;
        postal_code: string | null;
      }>
    | null;
};

type OrderItemRow = {
  product_id: number;
  quantity: number;
  unit_price: number;
  products: { name: string } | { name: string }[] | null;
};

type PaymentRow = {
  payment_method: string | null;
  payment_status: string | null;
  paid_at: string | null;
};

export async function getAdminOrderDetail(id: number): Promise<AdminOrderDetail | null> {
  try {
    const supabase = await createClient();

    const [orderRes, itemsRes, paymentRes] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, order_status, total_amount, created_at, cancel_reason, users(name, email, phone), addresses(recipient_name, phone, address_line, subdistrict, district, province, postal_code)",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase.from("order_items").select("product_id, quantity, unit_price, products(name)").eq("order_id", id),
      supabase
        .from("payments")
        .select("payment_method, payment_status, paid_at")
        .eq("order_id", id)
        .order("id", { ascending: false })
        .limit(1),
    ]);

    if (orderRes.error || !orderRes.data) {
      if (orderRes.error) console.error("getAdminOrderDetail order error:", orderRes.error.message);
      return null;
    }

    const order = orderRes.data as OrderDetailRow;
    const customer = firstOf(order.users) ?? { name: null, email: null, phone: null };
    const addressRow = firstOf(order.addresses);

    if (itemsRes.error) console.error("getAdminOrderDetail items error:", itemsRes.error.message);
    if (paymentRes.error) console.error("getAdminOrderDetail payment error:", paymentRes.error.message);

    const items: AdminOrderItem[] = ((itemsRes.data ?? []) as OrderItemRow[]).map((row) => ({
      productId: row.product_id,
      productName: firstOf(row.products)?.name ?? "สินค้าที่ถูกลบ",
      quantity: row.quantity,
      unitPrice: Number(row.unit_price),
    }));

    const paymentRow = ((paymentRes.data ?? []) as PaymentRow[])[0] ?? null;

    return {
      id: order.id,
      status: order.order_status as OrderStatus,
      totalAmount: Number(order.total_amount ?? 0),
      createdAt: order.created_at,
      cancelReason: order.cancel_reason,
      customer,
      address: addressRow
        ? {
            recipientName: addressRow.recipient_name,
            phone: addressRow.phone,
            addressLine: addressRow.address_line,
            subdistrict: addressRow.subdistrict,
            district: addressRow.district,
            province: addressRow.province,
            postalCode: addressRow.postal_code,
          }
        : null,
      items,
      payment: paymentRow
        ? { method: paymentRow.payment_method, status: paymentRow.payment_status, paidAt: paymentRow.paid_at }
        : null,
    };
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getAdminOrderDetail failed:", err);
    return null;
  }
}
