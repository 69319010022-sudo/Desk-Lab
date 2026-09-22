// Skeleton ระหว่างรอข้อมูลประวัติคำสั่งซื้อจาก Supabase — ไม่กระทบ logic ของหน้านี้เลย
export default function OrderHistoryLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-4 px-[28px] pb-[32px] pt-[24px]">
      <div className="h-7 w-48 rounded bg-sunken" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-[12px] bg-sunken" />
        ))}
      </div>
    </div>
  );
}
