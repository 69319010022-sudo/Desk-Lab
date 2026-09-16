// ป้ายเปอร์เซ็นต์เปลี่ยนแปลงเทียบช่วงก่อนหน้า ใช้กับการ์ด KPI ที่หน้า Dashboard
// percent > 0 = ป้ายเขียว (ขึ้น), percent < 0 = ป้ายแดง (ลง) — ใช้โทนสีเดียวกับ StatusBadge
// (status-delivered / status-cancelled) เพื่อไม่ต้องเพิ่มชุดสีใหม่
export default function TrendBadge({ percent }: { percent: number }) {
  const isUp = percent >= 0;
  const style = isUp
    ? "bg-[color:var(--color-status-delivered-bg)] text-[color:var(--color-status-delivered)]"
    : "bg-[color:var(--color-status-cancelled-bg)] text-[color:var(--color-status-cancelled)]";

  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${style}`}>
      {isUp ? "↗" : "↘"} {isUp ? "+" : ""}
      {percent.toLocaleString("th-TH")}%
    </span>
  );
}
