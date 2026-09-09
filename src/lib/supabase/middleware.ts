import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// เรียกจาก middleware.ts (ที่ root ของโปรเจกต์) ทุกครั้งที่มี request เข้ามา
// หน้าที่ของมันคือ "ต่ออายุ" session token ของผู้ใช้ที่ล็อกอินอยู่ ก่อนที่ token
// จะหมดอายุ — ถ้าไม่มีขั้นตอนนี้ ผู้ใช้จะถูกเด้งออกจากระบบเองเป็นระยะๆ

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // ต้องเรียก getUser() (ไม่ใช่ getSession()) เพื่อให้ตรวจสอบ token กับ Supabase
  // Auth server จริงทุกครั้ง ป้องกันการปลอมแปลง session cookie ฝั่ง client
  await supabase.auth.getUser();

  return supabaseResponse;
}
