"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { fireAndForgetLog } from "@/lib/actions/logging";
import { createPromptPayCharge, getCharge, type OpnChargeStatus } from "@/lib/payments/opn";

// ตรวจว่า order นี้เป็นของผู้ใช้ที่ล็อกอินอยู่จริง — ต้องเช็คเองทุกครั้งก่อนใช้ service client
// เพราะ service client ข้าม RLS ได้หมด (ไม่มี Postgres ช่วยกันสิทธิ์ให้แล้ว)
async function assertOwnOrder(orderId: number): Promise<{ userId: string; totalAmount: number } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("id, total_amount, user_id")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) return null;
  return { userId: order.user_id, totalAmount: Number(order.total_amount) };
}

export type PromptPayQrResult =
  | { ok: true; qrImageDataUri: string | null; status: OpnChargeStatus; expiresAt: string | null }
  | { ok: false; error: string };

// สร้าง (หรือดึงของเดิมกลับมา) QR พร้อมเพย์จริงสำหรับออเดอร์นี้
// เรียกตอนโหลดหน้า /checkout/promptpay/[orderId] ครั้งแรก และตอนกด "สร้าง QR ใหม่"/"ลองสร้าง QR อีกครั้ง"
export async function getOrCreatePromptPayQrAction(orderId: number): Promise<PromptPayQrResult> {
  const owned = await assertOwnOrder(orderId);
  if (!owned) return { ok: false, error: "ไม่พบคำสั่งซื้อนี้" };

  const serviceClient = createServiceClient();
  const { data: payment } = await serviceClient
    .from("payments")
    .select("id, transaction_ref, payment_status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!payment) return { ok: false, error: "ไม่พบรายการชำระเงินของคำสั่งซื้อนี้" };
  if (payment.payment_status === "success") {
    return { ok: true, qrImageDataUri: null, status: "successful", expiresAt: null };
  }

  try {
    // มี charge เดิมอยู่แล้วและยังไม่หมดอายุ/ไม่ล้มเหลว — ใช้ของเดิมต่อแทนการสร้างใหม่ทุกครั้ง
    if (payment.transaction_ref) {
      const existing = await getCharge(payment.transaction_ref);
      const stillValid =
        existing.status !== "expired" &&
        existing.status !== "failed" &&
        (!existing.expiresAt || new Date(existing.expiresAt).getTime() > Date.now());
      if (stillValid) {
        return {
          ok: true,
          qrImageDataUri: existing.qrImageDataUri,
          status: existing.status,
          expiresAt: existing.expiresAt,
        };
      }
      // หมดอายุจริงตามเวลาของ Opn แล้ว (แม้ status ที่ Opn ยังไม่อัปเดตเป็น expired) — เคลียร์สถานะ
      // การชำระเงินเดิมทิ้งก่อนสร้าง charge ใหม่ กันไม่ให้ QR เก่าที่หมดอายุแล้วยังดูจ่ายได้
      if (payment.payment_status !== "failed") {
        await serviceClient.from("payments").update({ payment_status: "failed" }).eq("id", payment.id);
        fireAndForgetLog(owned.userId, "payment.failed", "payments", payment.id, {
          orderId,
          reason: "expired",
        });
      }
    }

    const charge = await createPromptPayCharge(owned.totalAmount, `DeskLab Order #${orderId}`);
    await serviceClient
      .from("payments")
      .update({ transaction_ref: charge.chargeId, payment_status: "pending" })
      .eq("id", payment.id);
    return { ok: true, qrImageDataUri: charge.qrImageDataUri, status: charge.status, expiresAt: charge.expiresAt };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "สร้าง QR ไม่สำเร็จ" };
  }
}

export type PaymentStatusResult =
  | { ok: true; status: OpnChargeStatus }
  | { ok: false; error: string };

// ปุ่ม "ตรวจสอบสถานะการชำระเงิน" — เรียก Opn ตรงๆ แทนการรอ webhook
// (เว็บรันบน localhost ตอนพัฒนา รับ webhook จริงจาก Opn เข้ามาไม่ถึง)
export async function checkPromptPayStatusAction(orderId: number): Promise<PaymentStatusResult> {
  const owned = await assertOwnOrder(orderId);
  if (!owned) return { ok: false, error: "ไม่พบคำสั่งซื้อนี้" };

  const serviceClient = createServiceClient();
  const { data: payment } = await serviceClient
    .from("payments")
    .select("id, transaction_ref, payment_status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!payment) return { ok: false, error: "ไม่พบรายการชำระเงินของคำสั่งซื้อนี้" };
  if (payment.payment_status === "success") return { ok: true, status: "successful" };
  if (!payment.transaction_ref) return { ok: false, error: "ยังไม่ได้สร้าง QR สำหรับคำสั่งซื้อนี้" };

  try {
    let charge = await getCharge(payment.transaction_ref);

    // Opn เองอาจอัปเดตสถานะ "expired" ช้ากว่าเวลาหมดอายุจริงเล็กน้อย — ถ้าเลยเวลา expiresAt ที่เรา
    // คำนวณไว้แล้วแต่ Opn ยังบอกว่า pending อยู่ ให้ถือว่าหมดอายุไปเลยฝั่งเรา กัน QR เก่าไว้จ่ายไม่ได้จริง
    if (
      charge.status === "pending" &&
      charge.expiresAt &&
      new Date(charge.expiresAt).getTime() <= Date.now()
    ) {
      charge = { ...charge, status: "expired" };
    }

    if (charge.status === "successful") {
      await serviceClient
        .from("payments")
        .update({ payment_status: "success", paid_at: new Date().toISOString() })
        .eq("id", payment.id);
      // อัปเดตสถานะออเดอร์เป็น "paid" ต้องผ่าน service client เท่านั้น เพราะ RLS ของ orders
      // ไม่มี policy ให้ authenticated ทั่วไปเปลี่ยนสถานะเป็น paid เอง (กันลูกค้าปลอมสถานะจ่ายเงิน)
      await serviceClient.from("orders").update({ order_status: "paid" }).eq("id", orderId);

      // Log successful payment
      fireAndForgetLog(owned.userId, "payment.charged", "payments", payment.id, {
        orderId,
        amount: owned.totalAmount,
        transactionRef: charge.chargeId,
      });

      revalidatePath(`/checkout/promptpay/${orderId}`);
      revalidatePath("/account/orders");
      revalidatePath(`/account/orders/${orderId}`);
    } else if (charge.status === "failed" || charge.status === "expired") {
      await serviceClient.from("payments").update({ payment_status: "failed" }).eq("id", payment.id);

      // Log failed payment
      fireAndForgetLog(owned.userId, "payment.failed", "payments", payment.id, {
        orderId,
        reason: charge.status,
      });
    }

    return { ok: true, status: charge.status };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "ตรวจสอบสถานะไม่สำเร็จ" };
  }
}