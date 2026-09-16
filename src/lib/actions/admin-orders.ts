"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Server Action สำหรับเปลี่ยนสถานะออเดอร์ (ขั้นตอนที่ 7) — พึ่ง policy orders_admin_update
// (using/with check is_admin() แบบไม่จำกัดเงื่อนไข ทำไว้ขั้นตอนที่ 3) แอดมินเปลี่ยนเป็น
// สถานะไหนก็ได้ ไม่บังคับลำดับ (ต่างจากฝั่งลูกค้าที่จำกัดแค่ pending→cancelled เท่านั้น)
// รอบนี้เปลี่ยนแค่ orders.order_status ไม่แตะตาราง payments

export type AdminActionState = { error?: string; success?: boolean } | null;

const VALID_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export async function updateOrderStatusAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = Number(formData.get("id"));
  const status = String(formData.get("order_status") ?? "");

  if (!id) return { error: "ไม่พบออเดอร์" };
  if (!VALID_STATUSES.includes(status)) return { error: "สถานะไม่ถูกต้อง" };

  const supabase = await createClient();
  const { error } = await supabase.from("orders").update({ order_status: status }).eq("id", id);

  if (error) {
    console.error("updateOrderStatusAction error:", error.message);
    return { error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  return { success: true };
}
