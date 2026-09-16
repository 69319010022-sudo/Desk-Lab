import { formatBaht } from "@/lib/demo-data";
import type { DailySales } from "@/lib/data/admin-analytics";

// กราฟเส้นยอดขายรายวันของสัปดาห์นี้ วาดด้วย SVG ล้วน (ไม่เพิ่ม chart library ใหม่) —
// เป็น Server Component ล้วน ไม่ต้องใช้ JS ฝั่ง client เหมือน SalesBarChart
const VIEW_WIDTH = 700;
const VIEW_HEIGHT = 200;
const PAD_X = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 16;

export default function WeeklySalesLineChart({ data }: { data: DailySales[] }) {
  const max = Math.max(1, ...data.map((d) => d.sales));
  const plotWidth = VIEW_WIDTH - PAD_X * 2;
  const plotHeight = VIEW_HEIGHT - PAD_TOP - PAD_BOTTOM;
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PAD_X + step * i;
    const y = PAD_TOP + (1 - d.sales / max) * plotHeight;
    return { ...d, x, y };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className="h-[180px] w-full" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={VIEW_WIDTH}
            y1={PAD_TOP + plotHeight * fraction}
            y2={PAD_TOP + plotHeight * fraction}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        ))}
        <polyline points={linePath} fill="none" stroke="var(--color-ink)" strokeWidth={2} />
        {points.map((p) => (
          <circle key={p.date} cx={p.x} cy={p.y} r={4} fill="var(--color-ink)">
            <title>
              {p.label}: {formatBaht(p.sales)} ({p.orderCount} ออเดอร์)
            </title>
          </circle>
        ))}
      </svg>
      <div className="flex text-[10px] text-muted" style={{ paddingInline: PAD_X }}>
        {data.map((d) => (
          <span key={d.date} className="flex-1 text-center">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
