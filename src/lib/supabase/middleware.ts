import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// เรียกจาก src/proxy.ts ทุกครั้งที่มี request เข้ามา (เดิมชื่อ middleware.ts —
// Next.js 16 เปลี่ยนชื่อ convention เป็น proxy.ts แต่ทำหน้าที่เดิมทุกอย่าง)
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminPath = pathname.startsWith("/admin");

  // Guard เฉพาะโซนแอดมิน (/admin/*) — ต้องล็อกอินและมี role = 'admin' หรือ 'cashier' ใน
  // public.users เท่านั้นถึงจะเข้าได้ ไม่ล็อกอิน -> เด้งไป /login,
  // ล็อกอินแต่ไม่ใช่ admin/cashier -> เด้งกลับหน้าแรก ไม่กระทบ flow ลูกค้าทั่วไปเลย
  // cashier มีสิทธิ์จำกัดกว่า admin: เข้าได้เฉพาะ /admin/orders กับ /admin/account เท่านั้น
  if (isAdminPath) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin" && profile?.role !== "cashier") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (profile?.role === "cashier") {
      const isAllowedForCashier =
        pathname === "/admin" ||
        pathname.startsWith("/admin/orders") ||
        pathname.startsWith("/admin/account");

      if (!isAllowedForCashier) {
        const redirectResponse = NextResponse.redirect(new URL("/admin/orders", request.url));
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie);
        });
        return redirectResponse;
      }
    }

    return supabaseResponse;
  }

  // แก้ปัญหา 2026-09-13: เดิม signInAction พาแอดมินไป /admin/dashboard แค่ตอน "ล็อกอินสำเร็จ
  // ครั้งใหม่" เท่านั้น — ถ้า session เดิมยังอยู่ (เช่น restart dev server / deploy ใหม่แล้วเปิด
  // เว็บขึ้นมาโดยยังไม่ได้ล็อกเอาต์) จะไม่มีอะไรพาแอดมินกลับไป dashboard อีก ทำให้เห็นหน้าลูกค้า
  // แทน — แก้ให้ครอบคลุมทุก request: ถ้าล็อกอินอยู่และเป็นแอดมิน/แคชเชียร์ แล้วพยายามเข้าหน้าไหน
  // ก็ตามที่ไม่ใช่โซนแอดมินและไม่ใช่หน้า auth (login/register/ลืมรหัสผ่าน/ตั้งรหัสผ่านใหม่/
  // ยืนยันอีเมล) ให้เด้งกลับโซนแอดมินเสมอ — ตรงกับดีไซน์ที่ตั้งใจไว้ว่าบัญชีแอดมิน/แคชเชียร์มีไว้
  // เข้าโซนแอดมินเท่านั้น ไม่ใช้ช้อปปิ้ง/ตะกร้า/ที่อยู่แบบลูกค้าทั่วไป — ปลายทางของแอดมินคือ
  // /admin/dashboard ส่วนแคชเชียร์คือ /admin/orders
  const AUTH_FLOW_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password", "/auth"];
  const isAuthFlowPath = AUTH_FLOW_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (user && !isAuthFlowPath) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const redirectTarget =
      profile?.role === "admin" ? "/admin/dashboard" : profile?.role === "cashier" ? "/admin/orders" : null;

    if (redirectTarget) {
      // ต้องคัดลอกคุกกี้ที่ refresh แล้วจาก supabaseResponse มาด้วย ไม่งั้นถ้า token
      // เพิ่งถูกต่ออายุในรีเควสต์นี้ คุกกี้ใหม่จะหายไปเพราะเราคืนค่า redirect response
      // อันใหม่แทนที่จะเป็น supabaseResponse ตัวเดิม
      const redirectResponse = NextResponse.redirect(new URL(redirectTarget, request.url));
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie);
      });
      return redirectResponse;
    }
  }

  return supabaseResponse;
}
