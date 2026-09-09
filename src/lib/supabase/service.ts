import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ ใช้ไฟล์นี้เฉพาะในโค้ดฝั่งเซิร์ฟเวอร์ที่เชื่อถือได้เท่านั้น (Server Action / Route Handler)
// ห้าม import จาก Client Component ("use client") เด็ดขาด — service_role key ข้าม RLS ได้ทั้งหมด
// ทุกครั้งที่เรียก createServiceClient() ต้องเช็คสิทธิ์เจ้าของข้อมูล (เช่น orders.user_id ตรงกับ
// ผู้ใช้ปัจจุบัน) ด้วยโค้ดเองก่อนเสมอ เพราะ RLS จะไม่ช่วยกันให้แล้ว (ดูตัวอย่างการใช้งานใน
// src/lib/actions/payments.ts ฟังก์ชัน assertOwnOrder)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createServiceClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "ไม่พบ NEXT_PUBLIC_SUPABASE_URL หรือ SUPABASE_SERVICE_ROLE_KEY — " +
        "ใส่ค่า SUPABASE_SERVICE_ROLE_KEY (จาก Supabase Dashboard > Project Settings > API > service_role) " +
        "ลงใน .env.local ก่อน",
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
