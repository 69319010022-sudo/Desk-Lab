// Skeleton ระหว่างรอข้อมูลที่อยู่/ตะกร้าจาก Supabase — ไม่กระทบ logic ของ CheckoutPage เลย
export default function CheckoutLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-6 px-4 pb-[32px] pt-[24px] lg:px-[28px]">
      <div className="h-7 w-32 rounded bg-sunken" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-[12px] bg-sunken" />
        <div className="h-64 rounded-[12px] bg-sunken" />
      </div>
    </div>
  );
}
