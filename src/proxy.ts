import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 เปลี่ยนชื่อไฟล์นี้จาก middleware.ts เป็น proxy.ts (ยังทำหน้าที่เดิมทุกอย่าง
// แค่เปลี่ยนชื่อ/ชื่อฟังก์ชันที่ export) — ต้องอยู่ใน src/ (ไม่ใช่ root โปรเจกต์) เพราะ
// โปรเจกต์นี้ใช้โครงสร้าง src/ directory (มี src/app, src/lib, src/components)
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // รันทุก path ยกเว้นไฟล์ static (รูปภาพ, ไอคอน ฯลฯ) เพื่อลดงานที่ไม่จำเป็น
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
