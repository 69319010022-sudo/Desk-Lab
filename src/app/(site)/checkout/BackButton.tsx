"use client";

import { useRouter } from "next/navigation";

// ปุ่มย้อนกลับไปหน้าก่อนหน้าที่กดเข้ามาหน้าชำระเงิน (ปกติคือตะกร้า) ใช้ router.back()
// แทนการ Link ไป /cart ตรงๆ เพราะผู้ใช้อาจเข้าชำระเงินจากที่อื่น (เช่นซื้อทันทีจากหน้าสินค้า)
export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-subtle text-muted transition-colors hover:bg-sunken hover:text-ink"
      aria-label="ย้อนกลับ"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}
