"use client";

// ปุ่มกดพิมพ์ใบเสร็จ — เป็น client component เล็กๆ แค่เรียก window.print() (ต้อง "use client"
// เพราะใช้ onClick ซึ่งเป็น browser API ไม่ทำงานใน Server Component)
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
    >
      พิมพ์ใบเสร็จ
    </button>
  );
}
