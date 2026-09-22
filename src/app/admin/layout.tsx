import { redirect } from "next/navigation";
import AdminRail from "@/components/admin/AdminRail";
import AdminRealtimeRefresh from "@/components/admin/AdminRealtimeRefresh";
import AdminTopBar from "@/components/admin/AdminTopBar";
import { getCurrentUser } from "@/lib/data/auth";

// Layout เฉพาะโซนแอดมิน (/admin/*) — แยกจาก (site) โดยสิ้นเชิง ไม่ใช้ Rail/TopBar/Footer
// ของฝั่งลูกค้าเลย middleware.ts (src/lib/supabase/middleware.ts) เช็ค role ไปแล้วชั้นหนึ่ง
// ก่อนถึงตรงนี้ (กันไม่ให้ request ที่ไม่ใช่ admin หลุดเข้ามา) แต่เช็คซ้ำที่นี่อีกชั้นเผื่อกรณี
// edge (defense in depth) — ถ้าไม่ใช่ admin จะไม่ render โซนแอดมินให้เห็นแม้แต่วินาทีเดียว
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirectTo=/admin/dashboard");
  }

  if (user.role !== "admin" && user.role !== "cashier") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      {/* print:hidden — ซ่อน Sidebar/TopBar ตอนพิมพ์ (ใช้กับหน้าใบเสร็จ ขั้นตอนที่ 7) */}
      <AdminRealtimeRefresh />
      <div className="print:hidden">
        <AdminRail role={user.role} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col bg-sunken print:bg-white">
        <div className="print:hidden">
          <AdminTopBar user={user} />
        </div>
        <main className="flex-1 p-7 print:p-0">{children}</main>
      </div>
    </div>
  );
}
