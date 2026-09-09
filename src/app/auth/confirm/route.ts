import { NextRequest, NextResponse } from "next/server";

// Route Handler ที่ Supabase ส่งลิงก์อีเมล (ยืนยันตัวตน/รีเซ็ตรหัสผ่าน) มาหา
//
// เดิมแลก code (PKCE) เป็น session ทันทีที่นี่ตอน GET แต่พบปัญหาจริง: อีเมลบางเจ้า (เช่น Gmail)
// จะสแกนลิงก์ในอีเมลด้วยการยิง GET request ไปที่ลิงก์นี้ล่วงหน้าโดยอัตโนมัติเพื่อตรวจสอบความ
// ปลอดภัย (link prefetching/scanning) — ทำให้ code แบบใช้ได้ครั้งเดียวถูกใช้ไปก่อนที่ผู้ใช้จะกด
// ลิงก์เองจริงๆ ผู้ใช้เลยเจอ error "ลิงก์หมดอายุ" ทั้งที่เพิ่งได้รับอีเมลมาสดๆ
//
// แก้โดยให้ route นี้ (GET) แค่ส่งต่อ code ไปหน้ายืนยัน (/auth/confirm-recovery) ที่ต้องให้
// ผู้ใช้กดปุ่มเอง (เกิด POST ผ่าน Server Action) ถึงจะแลก code เป็น session จริง — ตัวสแกน
// อีเมลที่ยิงแค่ GET เฉยๆ จะไม่ไปกดปุ่มแทนผู้ใช้ code เลยไม่ถูกใช้ไปก่อน
//
// (หมายเหตุ: เคยลองเปลี่ยนไปใช้ token_hash + verifyOtp เพื่อเลี่ยงปัญหา PKCE code_verifier
// แต่ต้องแก้ Email Template ใน Supabase Dashboard ซึ่งล็อกไว้จนกว่าจะตั้งค่า custom SMTP เอง —
// ทางเลือกนี้ยังปิดอยู่ ไม่ใช่เรื่องด่วนเพราะ flow แบบ code + exchangeCodeForSession ปัจจุบัน
// ใช้งานได้ปกติแล้ว (ดูหมายเหตุแก้ไขทฤษฎีเดิมใน ForgotPasswordForm.tsx และ lib/actions/auth.ts —
// error "PKCE code verifier not found" ที่เคยเจอเกิดจากทดสอบข้ามเบราว์เซอร์ ไม่ใช่บั๊กของโค้ด)
// ทางเลือก token_hash จะมีประโยชน์จริงตอนอยากรองรับ "ขอลิงก์จากคอม แล้วกดลิงก์จากมือถือ" เท่านั้น
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/forgot-password?error=invalid_link`);
  }

  const confirmUrl = new URL(`${origin}/auth/confirm-recovery`);
  confirmUrl.searchParams.set("code", code);
  confirmUrl.searchParams.set("next", next);
  return NextResponse.redirect(confirmUrl);
}
