import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Container from "@/components/Container";
import { formatBaht } from "@/lib/demo-data";
import { getOrderById } from "@/lib/data/orders";
import { getPaymentByOrderId } from "@/lib/data/payments";
import { getOrCreatePromptPayQrAction } from "@/lib/actions/payments";
import PromptPayStatus from "./PromptPayStatus";

// หน้าแสดง QR พร้อมเพย์จริง (เชื่อม Opn Payments โหมดทดสอบ) หลังกด "ยืนยันคำสั่งซื้อ"
// ด้วยวิธีพร้อมเพย์ที่หน้า checkout
export default async function PromptPayPage(props: PageProps<"/checkout/promptpay/[orderId]">) {
  const { orderId } = await props.params;
  const id = Number(orderId);
  if (!Number.isInteger(id)) notFound();

  const order = await getOrderById(id);
  if (!order) notFound();

  const payment = await getPaymentByOrderId(id);
  if (!payment || payment.paymentMethod !== "promptpay") {
    // ออเดอร์นี้ไม่ได้เลือกชำระผ่านพร้อมเพย์ (หรือไม่มีข้อมูลชำระเงิน) — พาไปหน้ารายละเอียดออเดอร์แทน
    redirect(`/account/orders/${id}`);
  }
  if (payment.paymentStatus === "success" || order.status === "cancelled") {
    // จ่ายไปแล้ว หรือออเดอร์ถูกยกเลิกไปแล้ว — ไม่ต้องโชว์ QR อีก
    redirect(`/account/orders/${id}`);
  }

  const initialResult = await getOrCreatePromptPayQrAction(id);

  return (
    <Container className="flex flex-col items-center gap-6 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">ชำระเงินผ่านพร้อมเพย์</h1>
        <p className="mt-1 text-sm text-muted">
          เลขที่คำสั่งซื้อ: {order.id} · ยอดชำระ {formatBaht(order.totalAmount)}
        </p>
      </div>

      <PromptPayStatus orderId={id} initialResult={initialResult} />

      <Link href="/account/orders" className="text-sm text-muted transition-colors hover:text-ink">
        ← กลับไปประวัติคำสั่งซื้อ (ชำระทีหลังได้)
      </Link>
    </Container>
  );
}
