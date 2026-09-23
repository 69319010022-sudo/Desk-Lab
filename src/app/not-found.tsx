import Link from "next/link";

// หน้า 404 แบบมีแบรนด์ — ใช้เมื่อ path ไม่ตรงกับ route ไหนเลยทั้งเว็บ (ครอบคลุมทั้งฝั่งลูกค้า/แอดมิน
// เพราะ Next.js render ไฟล์นี้ผ่าน root layout เท่านั้น ไม่มี Rail/TopBar ของ (site)/admin
// ติดมาด้วย) กันไม่ให้เจอหน้า error เปล่าๆ ของ Next.js เอง เช่นตอนพิมพ์ URL ผิดหรือลิงก์เก่าค้าง
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-lockup.png" alt="DeskLab" className="h-9 w-auto" />
      <div className="space-y-2">
        <p className="font-mono text-5xl font-semibold text-ink">404</p>
        <p className="text-base font-semibold text-ink">ไม่พบหน้านี้</p>
        <p className="text-sm text-muted">หน้าที่คุณกำลังมองหาอาจถูกย้ายหรือไม่มีอยู่จริง</p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-ink px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        กลับหน้าแรก
      </Link>
    </main>
  );
}
