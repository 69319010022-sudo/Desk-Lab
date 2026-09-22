// Skeleton ระหว่างรอข้อมูลประวัติคำสั่งซื้อจาก Supabase — ไม่กระทบ logic ของหน้านี้เลย
// (เดิมใส่ px-[28px] เพิ่มเองทั้งที่หน้าจริง orders/page.tsx ไม่มี padding ของตัวเอง —
// พึ่ง Container จาก account/layout.tsx อย่างเดียว ซึ่ง layout ยังคงอยู่ระหว่างโหลดด้วย —
// ทำให้ skeleton เยื้องผิดตำแหน่งเทียบกับเนื้อหาจริง ตัดออกให้ตรงกัน)
export default function OrderHistoryLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-7 w-48 rounded bg-sunken" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[12px] bg-sunken" />
        ))}
      </div>
    </div>
  );
}
