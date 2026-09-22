// Skeleton ระหว่างรอข้อมูลสินค้า/รีวิว/สินค้าที่เกี่ยวข้องจาก Supabase — ไม่กระทบ logic
// ของ ProductDetailPage เลย เป็นแค่ fallback UI ระหว่างรอโหลด
export default function ProductDetailLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-[40px] px-4 pb-[32px] pt-[24px] lg:px-[28px]">
      <div className="grid grid-cols-1 gap-[32px] lg:grid-cols-[1fr_420px]">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3">
          <div className="aspect-square rounded-[12px] bg-sunken" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="size-16 rounded-[8px] bg-sunken" />
            ))}
          </div>
        </div>
        <div className="flex h-fit flex-col gap-[16px] rounded-[12px] border border-subtle bg-background p-[24px]">
          <div className="h-4 w-24 rounded bg-sunken" />
          <div className="h-8 w-3/4 rounded bg-sunken" />
          <div className="h-4 w-40 rounded bg-sunken" />
          <div className="h-9 w-32 rounded bg-sunken" />
          <div className="h-11 w-full rounded-[10px] bg-sunken" />
        </div>
      </div>
    </div>
  );
}
