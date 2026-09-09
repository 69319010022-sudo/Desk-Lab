import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ใช้ไฟล์นี้เฉพาะใน Server Component / Server Action / Route Handler
// (โค้ดที่รันบนเซิร์ฟเวอร์เท่านั้น เช่น หน้า page.tsx ที่ไม่มี "use client")
// ต้อง async เพราะ Next.js App Router ให้ cookies() เป็น async function

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "ไม่พบ NEXT_PUBLIC_SUPABASE_URL หรือ NEXT_PUBLIC_SUPABASE_ANON_KEY — " +
      "คัดลอก .env.local.example เป็น .env.local แล้วใส่ค่าจาก Supabase Dashboard > Project Settings > API",
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // เรียก setAll จาก Server Component ตรงๆ ได้ แต่เซ็ตคุกกี้ไม่ได้ (ข้อจำกัดของ Next.js)
          // ไม่เป็นไร เพราะ middleware.ts จะเป็นตัวรีเฟรช session แทนอยู่แล้ว
        }
      },
    },
  });
}
