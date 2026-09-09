import { createBrowserClient } from "@supabase/ssr";

// ใช้ไฟล์นี้เฉพาะใน Client Component (ไฟล์ที่มี "use client" อยู่บนสุด)
// เช่น ปุ่มล็อกอิน, ฟอร์มตะกร้าสินค้าที่มี state โต้ตอบกับผู้ใช้

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "ไม่พบ NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_ANON_KEY — " +
      "คัดลอก .env.local.example เป็น .env.local แล้วใส่ค่าจาก Supabase Dashboard > Project Settings > API",
  );
}

// NEXT_PUBLIC_ ข้างหน้าจำเป็น เพื่อให้ Next.js ยอม bundle ค่านี้ไปฝั่ง browser ได้
// ใช้ anon key เท่านั้น (ไม่ใช่ service_role) — ปลอดภัยเพราะ RLS ในฐานข้อมูลเป็นตัวคุมสิทธิ์จริง
export function createClient() {
  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}
