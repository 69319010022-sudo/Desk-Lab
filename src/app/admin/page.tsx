import { redirect } from "next/navigation";

// /admin เฉยๆ ไม่มีเนื้อหาของตัวเอง ให้เด้งไปหน้าแดชบอร์ดเป็นค่าเริ่มต้นเสมอ
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
