import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/demo-data";

export type OrderItemSummary = {
  productName: string;
  quantity: number;
};

export type OrderSummary = {
  id: number;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemSummary[];
};

export type OrderDetailItem = {
  productName: string;
  productSlug: string | null;
  quantity: number;
  unitPrice: number;
};

export type OrderDetail = {
  id: number;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderDetailItem[];
  address: {
    label: string | null;
    recipientName: string | null;
    phone: string | null;
    addressLine: string | null;
    subdistrict: string | null;
    district: string | null;
    province: string | null;
    postalCode: string | null;
  } | null;
  paymentMethod: string | null;
  cancelReason: string | null;
};

type OrderRow = {
  id: number;
  order_status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items: { quantity: number; products: { name: string } | null }[] | null;
};

// ประวัติคำสั่งซื้อจริงของผู้ใช้ปัจจุบัน เรียงใหม่สุดก่อน (RLS จำกัดให้เห็นเฉพาะของตัวเอง)
export async function getOrders(): Promise<OrderSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("id, order_status, total_amount, created_at, order_items(quantity, products(name))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as OrderRow[]).map((row) => ({
    id: row.id,
    createdAt: new Date(row.created_at).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    status: row.order_status,
    totalAmount: Number(row.total_amount),
    items: (row.order_items ?? [])
      .filter((it): it is { quantity: number; products: { name: string } } => it.products != null)
      .map((it) => ({ productName: it.products.name, quantity: it.quantity })),
  }));
}

type OrderDetailRow = {
  id: number;
  order_status: OrderStatus;
  total_amount: number;
  created_at: string;
  order_items:
    | { quantity: number; unit_price: number; products: { name: string; slug: string } | null }[]
    | null;
  addresses: {
    label: string | null;
    recipient_name: string | null;
    phone: string | null;
    address_line: string | null;
    subdistrict: string | null;
    district: string | null;
    province: string | null;
    postal_code: string | null;
  } | null;
  payments: { payment_method: string }[] | null;
  cancel_reason: string | null;
};

// รายละเอียดคำสั่งซื้อเดียว สำหรับหน้า "ดูรายละเอียด" (RLS จำกัดให้เห็นเฉพาะของตัวเอง)
export async function getOrderById(orderId: number): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_status, total_amount, created_at, cancel_reason, order_items(quantity, unit_price, products(name, slug)), addresses(label, recipient_name, phone, address_line, subdistrict, district, province, postal_code), payments(payment_method)",
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as OrderDetailRow;

  return {
    id: row.id,
    createdAt: new Date(row.created_at).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    status: row.order_status,
    totalAmount: Number(row.total_amount),
    items: (row.order_items ?? [])
      .filter(
        (it): it is { quantity: number; unit_price: number; products: { name: string; slug: string } } =>
          it.products != null,
      )
      .map((it) => ({
        productName: it.products.name,
        productSlug: it.products.slug,
        quantity: it.quantity,
        unitPrice: Number(it.unit_price),
      })),
    address: row.addresses
      ? {
          label: row.addresses.label,
          recipientName: row.addresses.recipient_name,
          phone: row.addresses.phone,
          addressLine: row.addresses.address_line,
          subdistrict: row.addresses.subdistrict,
          district: row.addresses.district,
          province: row.addresses.province,
          postalCode: row.addresses.postal_code,
        }
      : null,
    paymentMethod: row.payments?.[0]?.payment_method ?? null,
    cancelReason: row.cancel_reason,
  };
}
