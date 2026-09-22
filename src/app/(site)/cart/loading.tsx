// Skeleton ระหว่างรอข้อมูลตะกร้าจาก Supabase — ไม่กระทบ logic ของ CartPage เลย
export default function CartLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-[24px] px-4 pb-[28px] pt-[24px] lg:flex-row lg:px-[28px]">
      <div className="min-w-0 flex-1">
        <div className="mb-4 h-7 w-40 rounded bg-sunken" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-[12px] bg-sunken" />
          ))}
        </div>
      </div>
      <div className="h-52 w-full rounded-[12px] bg-sunken lg:w-[340px] lg:shrink-0" />
    </div>
  );
}
