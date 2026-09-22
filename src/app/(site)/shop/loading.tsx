// Skeleton ระหว่างรอข้อมูลสินค้า/หมวดหมู่/ตะกร้าจาก Supabase (เพิ่มเข้ามาเพื่อลดความรู้สึก
// "ค้าง" ตอนกดเปลี่ยนหน้า — ไม่กระทบ logic ของ ShopPage เลย เป็นแค่ fallback UI ของ
// Next.js App Router ระหว่างรอ Server Component โหลดเสร็จ)
export default function ShopLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-[24px] px-4 pb-[28px] pt-[24px] lg:flex-row lg:px-[28px]">
      <div className="min-w-0 flex-1">
        <div className="mb-4 h-9 w-64 rounded-[8px] bg-sunken" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-[999px] bg-sunken" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-[20px] md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="aspect-square rounded-[12px] bg-sunken" />
              <div className="h-4 w-3/4 rounded bg-sunken" />
              <div className="h-4 w-1/2 rounded bg-sunken" />
            </div>
          ))}
        </div>
      </div>
      <div className="w-full rounded-[12px] border border-subtle bg-background p-4 lg:w-[280px] lg:shrink-0">
        <div className="mb-4 h-5 w-32 rounded bg-sunken" />
        <div className="h-24 rounded bg-sunken" />
      </div>
    </div>
  );
}
