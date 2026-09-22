import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/auth";

// /admin เฉยๆ ไม่มีเนื้อหาของตัวเอง ให้เด้งไปหน้าแรกตามสิทธิ์ของแต่ละ role —
// admin ไปแดชบอร์ด, cashier ไปหน้าคำสั่งซื้อ (cashier เข้าแดชบอร์ดไม่ได้)
export default async function AdminIndexPage() {
  const user = await getCurrentUser();

  if (user?.role === "cashier") {
    redirect("/admin/orders");
  }

  redirect("/admin/dashboard");
}
