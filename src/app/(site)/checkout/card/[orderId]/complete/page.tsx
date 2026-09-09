import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { checkPromptPayStatusAction } from "@/lib/actions/payments";

// หน้านี้จะถูกเรียกก็ต่อเมื่อบัตรที่ใช้ต้องยืนยันตัวตนเพิ่มเติมแบบ 3-D Secure เท่านั้น —
// Opn Payments จะ redirect ลูกค้ากลับมาที่นี่เองหลังยืนยันตัวตนที่หน้าธนาคารเสร็จ
// (checkPromptPayStatusAction เป็นชื่อเดิมจากตอนทำพร้อมเพย์ แต่ตรวจสอบสถานะ charge แบบทั่วไป
// ไม่ได้ผูกกับพร้อมเพย์เท่านั้น จึงใช้ร่วมกับบัตรได้)
export default async function CardCompletePage(props: PageProps<"/checkout/card/[orderId]/complete">) {
  const { orderId } = await props.params;
  const id = Number(orderId);
  if (!Number.isInteger(id)) notFound();

  const result = await checkPromptPayStatusAction(id);
  const success = result.ok && result.status === "successful";

  return (
    <Container className="flex flex-col items-center gap-4 py-16 text-center">
      {success ? (
        <>
          <h1 className="text-xl font-bold text-[color:var(--color-status-delivered)]">ชำระเงินสำเร็จแล้ว</h1>
          <p className="text-sm text-muted">ยืนยันตัวตนกับธนาคารเรียบร้อย ขอบคุณที่สั่งซื้อกับ DeskLab</p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-[color:var(--color-status-cancelled)]">การชำระเงินไม่สำเร็จ</h1>
          <p className="text-sm text-muted">
            {result.ok
              ? "การยืนยันตัวตนกับธนาคารไม่สำเร็จหรือถูกยกเลิก กรุณาลองสั่งซื้อใหม่อีกครั้ง"
              : result.error}
          </p>
        </>
      )}
      <Link
        href={`/account/orders/${id}`}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        ไปที่รายละเอียดคำสั่งซื้อ
      </Link>
    </Container>
  );
}
