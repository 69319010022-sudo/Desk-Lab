"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { fireAndForgetLog } from "@/lib/actions/logging";

// Server Actions สำหรับสมัครสมาชิก/เข้าสู่ระบบ/ออกจากระบบ ผ่าน Supabase Auth จริง
// ใช้คู่กับ useActionState ฝั่ง Client Component (ดู LoginForm.tsx, register/page.tsx)

export type AuthActionState = { error: string } | null;

// ชื่อผู้ใช้ (username) — ตัดสินใจ 2026-09-05: ใช้แค่ "ชื่อผู้ใช้" แทน "ชื่อ-นามสกุล" เพราะ
// ชื่อ-นามสกุลจริงของลูกค้ารู้ได้จากที่อยู่จัดส่งอยู่แล้ว ไม่ต้องเก็บซ้ำ — บังคับรูปแบบ+ห้ามซ้ำ
// ทั้งฝั่ง client (pattern ใน register/page.tsx) และฝั่ง DB (CHECK+UNIQUE constraint บน
// public.users.name — migration enforce_username_format_and_uniqueness)
const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,30}$/;

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }
  if (message.toLowerCase().includes("already registered")) {
    return "อีเมลนี้ถูกใช้สมัครสมาชิกแล้ว กรุณาเข้าสู่ระบบแทน";
  }
  if (message.includes("Password should be at least")) {
    return "รหัสผ่านสั้นเกินไป (ต้องมีอย่างน้อย 6 ตัวอักษร)";
  }
  if (message.toLowerCase().includes("should be different")) {
    return "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม";
  }
  if (message.toLowerCase().includes("auth session missing")) {
    return "ลิงก์ตั้งรหัสผ่านใหม่หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่อีกครั้ง";
  }
  // เผื่อไว้ในกรณีที่มีคนแย่งชื่อผู้ใช้ไปพอดีในช่วงเสี้ยววินาทีระหว่างเช็คกับสมัครจริง
  // (ปกติดักไว้ก่อนแล้วด้วย pre-check ใน signUpAction แต่ DB constraint คือด่านสุดท้าย)
  if (message.toLowerCase().includes("users_name_unique") || message.toLowerCase().includes("duplicate key")) {
    return "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาเลือกชื่ออื่น";
  }
  return message;
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบ" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  // Log successful sign in
  if (data.user) {
    fireAndForgetLog(data.user.id, "auth.signed_in", "users", data.user.id, { email });
  }

  // ต้อง revalidate เพราะ Navbar (ใน layout) อ่านสถานะล็อกอินไว้แล้วตอน render ครั้งก่อน
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!username || !email || !password) {
    return { error: "กรุณากรอกชื่อผู้ใช้ อีเมล และรหัสผ่านให้ครบ" };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return { error: "ชื่อผู้ใช้ต้องเป็น a-z, 0-9, _ หรือ . เท่านั้น ความยาว 3-30 ตัวอักษร" };
  }
  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }
  if (password !== confirmPassword) {
    return { error: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" };
  }

  // เช็คชื่อผู้ใช้ซ้ำล่วงหน้าด้วย service role (ข้าม RLS) — ต้องใช้ service role เพราะตอนนี้
  // ยังไม่ได้ล็อกอิน (RLS ปกติของ users อ่านได้เฉพาะแถวตัวเองเท่านั้น เช็คชื่อคนอื่นไม่ได้เลย)
  // ทำแบบนี้เพื่อให้ error message เป็นภาษาไทยที่อ่านรู้เรื่อง แทนที่จะรอ DB constraint
  // ปฏิเสธตอน insert จริง (ซึ่ง error ที่ได้กลับมาจาก Supabase Auth มักไม่ชัดเจน)
  const serviceSupabase = createServiceClient();
  const { data: existingUser } = await serviceSupabase
    .from("users")
    .select("id")
    .eq("name", username)
    .maybeSingle();

  if (existingUser) {
    return { error: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาเลือกชื่ออื่น" };
  }

  const supabase = await createClient();
  // username/phone ถูกส่งไปเป็น user metadata — DB trigger (handle_new_auth_user)
  // จะอ่านค่านี้ไปสร้างแถวใน public.users ให้อัตโนมัติ ไม่ต้อง insert เองที่นี่
  // (คอลัมน์ในฐานข้อมูลยังชื่อ "name" เหมือนเดิม แค่ความหมายเปลี่ยนเป็นชื่อผู้ใช้แทนชื่อ-นามสกุล)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: username, phone: phone || null } },
  });

  if (error) {
    return { error: mapAuthError(error.message) };
  }

  // Log successful sign up
  if (data.user) {
    fireAndForgetLog(data.user.id, "auth.signed_up", "users", data.user.id, { email, username });
  }

  // ถ้าโปรเจกต์ Supabase เปิดบังคับให้ยืนยันอีเมลก่อน จะยังไม่มี session ตอนนี้
  // (data.session เป็น null) ต้องพาไปหน้า login พร้อมข้อความแจ้งเตือนแทน
  if (!data.session) {
    redirect("/login?registered=1");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  // Log sign out
  if (user) {
    fireAndForgetLog(user.id, "auth.signed_out", "users", user.id);
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

// หมายเหตุ: การขอลิงก์ตั้งรหัสผ่านใหม่ (resetPasswordForEmail) เรียกจากฝั่ง client แทน
// (ดู ForgotPasswordForm.tsx) ไม่ได้ทำเป็น Server Action ที่นี่ — **แก้ไขทฤษฎีเดิม (2026-09-05)**:
// ก่อนเคยเข้าใจผิดว่า @supabase/ssr เขียนคุกกี้ฝั่งเซิร์ฟเวอร์เฉพาะตอนมี auth event เท่านั้น แต่
// ตรวจสอบซอร์สโค้ดจริง (@supabase/ssr@0.12.5) แล้วพบว่าไม่จริง — เวอร์ชันนี้เขียนคุกกี้ PKCE
// code-verifier ทันทีทั้งฝั่ง client และ server สาเหตุจริงของ error "PKCE code verifier not found
// in storage" ที่เคยเจอคือ**ทดสอบข้ามเบราว์เซอร์** (ขอลิงก์จากเบราว์เซอร์หนึ่ง แล้วกดลิงก์ในอีเมล
// จากอีกเบราว์เซอร์) ซึ่งเป็นพฤติกรรมความปลอดภัยที่ตั้งใจของ PKCE ไม่ใช่บั๊ก — ทดสอบด้วยเบราว์เซอร์
// เดียวกันทั้งสองขั้นตอนแล้วใช้งานได้ปกติ (ยืนยันแล้ว 2026-09-05)

export type UpdatePasswordState = { error?: string } | null;

// ตั้งรหัสผ่านใหม่ — เรียกได้ก็ต่อเมื่อมี session อยู่แล้วเท่านั้น (มาจากลิงก์ในอีเมล ผ่าน
// /auth/confirm ที่แลก code เป็น session ให้ก่อนหน้านี้แล้ว — ดูหน้า reset-password/page.tsx)
export async function updatePasswordAction(
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 6) {
    return { error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }
  if (password !== confirmPassword) {
    return { error: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: mapAuthError(error.message) };
  }

  // Log password change
  if (user) {
    fireAndForgetLog(user.id, "auth.password_changed", "users", user.id);
  }

  // ออกจากระบบหลังตั้งรหัสผ่านใหม่สำเร็จ ให้ผู้ใช้ล็อกอินใหม่ด้วยรหัสผ่านใหม่อีกที (ชัดเจนกว่า)
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?reset=1");
}

export type ConfirmRecoveryState = { error?: string } | null;

// ยืนยันลิงก์ตั้งรหัสผ่านใหม่ — แลก code (PKCE) เป็น session ก็ต่อเมื่อผู้ใช้กดปุ่มเอง (POST)
// เท่านั้น ไม่แลกทันทีตอนลิงก์ในอีเมลถูกเปิด (ดู /auth/confirm/route.ts ว่าทำไม) เพราะอีเมล
// บางเจ้า เช่น Gmail จะสแกนลิงก์ในอีเมลด้วยการยิง GET request ไปที่ลิงก์ล่วงหน้าโดยอัตโนมัติ
// (link prefetching/scanning) ก่อนผู้ใช้จะกดลิงก์เองจริงๆ ซึ่งจะทำให้ code แบบใช้ครั้งเดียว
// ถูกใช้ไปก่อน ทำให้ผู้ใช้กดลิงก์จริงแล้วเจอ error "ลิงก์หมดอายุ" ทั้งที่ยังไม่เคยกดเลย
//
// การเรียก exchangeCodeForSession ที่นี่ (Server Action) ใช้ได้ปกติ ไม่เจอบั๊กคุกกี้แบบตอนขอ
// ลิงก์ (ดูคอมเมนต์เหนือ ForgotPasswordForm.tsx) เพราะการแลก code สำเร็จจะสร้าง session จริง
// (auth event SIGNED_IN) ทำให้ @supabase/ssr เขียนคุกกี้ session ให้ตามปกติ
export async function confirmPasswordResetAction(
  _prevState: ConfirmRecoveryState,
  formData: FormData,
): Promise<ConfirmRecoveryState> {
  const code = String(formData.get("code") ?? "");
  const next = String(formData.get("next") ?? "/reset-password");

  if (!code) {
    redirect("/forgot-password?error=invalid_link");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("exchangeCodeForSession ล้มเหลว:", error.message);
    redirect("/forgot-password?error=invalid_link");
  }

  // Log password reset confirmation
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    fireAndForgetLog(user.id, "auth.password_changed", "users", user.id, { source: "password_reset" });
  }

  redirect(next);
}
