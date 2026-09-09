import { createClient } from "@/lib/supabase/server";

export type PaymentInfo = {
  id: number;
  paymentMethod: string | null;
  paymentStatus: "pending" | "success" | "failed";
  amount: number;
  transactionRef: string | null;
};

// อ่านข้อมูลการชำระเงินของออเดอร์เดียว — RLS (payments_select_via_own_order) จำกัดให้เห็น
// เฉพาะ payments ของออเดอร์ที่เป็นของผู้ใช้ปัจจุบันเองอยู่แล้ว ไม่ต้องเช็คซ้ำในโค้ดนี้
export async function getPaymentByOrderId(orderId: number): Promise<PaymentInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("payments")
    .select("id, payment_method, payment_status, amount, transaction_ref")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    paymentMethod: data.payment_method,
    paymentStatus: data.payment_status,
    amount: Number(data.amount),
    transactionRef: data.transaction_ref,
  };
}
