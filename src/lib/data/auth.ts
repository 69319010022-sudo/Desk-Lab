import { createClient } from "@/lib/supabase/server";

// ไฟล์นี้อ่านข้อมูล "ผู้ใช้ที่ล็อกอินอยู่ตอนนี้" จาก Supabase Auth (auth.users)
// รวมกับโปรไฟล์ใน public.users (name, phone) — ใช้ได้เฉพาะใน Server Component/
// Server Action/Route Handler เท่านั้น (เพราะพึ่ง createClient จาก "@/lib/supabase/server")

// เรียก getUser() (ไม่ใช่ getSession()) เพื่อให้ Supabase ตรวจสอบ token กับ Auth
// server จริงทุกครั้ง — แพทเทิร์นเดียวกับที่ middleware.ts ใช้

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // แถวใน public.users ถูกสร้างอัตโนมัติผ่าน DB trigger ตอนสมัครสมาชิก
  // (ดู migration auto_create_public_user_on_signup) แต่กันไว้เผื่อยังไม่มีแถว
  // ด้วย maybeSingle() แทน single()
  const { data: profile } = await supabase
    .from("users")
    .select("name, phone, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name ?? null,
    phone: profile?.phone ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
}
