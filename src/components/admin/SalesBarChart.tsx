import { formatBaht } from "@/lib/demo-data";
import type { DailySales } from "@/lib/data/admin-analytics";

// กราฟแท่งง่ายๆ ด้วย CSS ล้วน (ไม่เพิ่ม chart library ใหม่) — ใช้ความสูงเป็น px คำนวณเอง
// แทนเปอร์เซ็นต์ เพราะ % height ของ flex child ที่ align แบบ flex-end จะไม่ทำงานถ้า parent
// ไม่ได้กำหนดความสูงตรงๆ (เป็น Server Component ล้วน ไม่ต้องใช้ JS ฝั่ง client)
const CHART_HEIGHT = 140;
const CONTAINER_HEIGHT = CHART_HEIGHT + 24;
// ความกว้างขั้นต่ำต่อแท่ง (รวม gap) — กันไม่ให้ label วันที่ ("10 ก.ย.") ถูกบีบจนล้นออกนอกการ์ด/
// หน้าเว็บทั้งหน้าบนจอมือถือ (flex item ปกติหดได้ไม่ต่ำกว่าความกว้างของ label เอง) แทนที่จะปล่อยให้
// ทั้งหน้าล้นแนวนอน ให้กราฟเลื่อนซ้าย-ขวาได้เฉพาะในกรอบของการ์ดนี้แทน
const BAR_MIN_WIDTH = 34;

export default function SalesBarChart({ data }: { data: DailySales[] }) {
  const max = Math.max(1, ...data.map((d) => d.sales));

  return (
    <div className="overflow-x-auto">
      <div
        className="flex items-end gap-2"
        style={{ height: CONTAINER_HEIGHT, minWidth: data.length * (BAR_MIN_WIDTH + 8) }}
      >
        {data.map((d) => {
          const barHeight = d.sales > 0 ? Math.max(4, Math.round((d.sales / max) * CHART_HEIGHT)) : 2;
          return (
            <div
              key={d.date}
              className="flex flex-1 flex-col items-center justify-end gap-1.5"
              style={{ height: CONTAINER_HEIGHT, minWidth: BAR_MIN_WIDTH }}
            >
              <div
                className="w-full rounded-t-md bg-ink"
                style={{ height: barHeight }}
                title={`${d.label}: ${formatBaht(d.sales)} (${d.orderCount} ออเดอร์)`}
              />
              <span className="whitespace-nowrap text-[10px] text-muted">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
