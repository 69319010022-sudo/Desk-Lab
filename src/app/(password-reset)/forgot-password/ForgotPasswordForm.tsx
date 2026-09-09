"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// เรียก resetPasswordForEmail() จาก client (แทนที่จะเป็น Server Action)
//
// อัปเดต (2026-09-05, ตรวจสอบซ้ำจากซอร์สโค้ดจริงของ @supabase/ssr@0.12.5 บนเครื่องนี้):
// ทฤษฎีเดิมที่เคยบันทึกไว้ (ว่า createServerClient เขียนคุกกี้เฉพาะตอนมี auth event) **ไม่ตรงกับ
// โค้ดจริงในเวอร์ชันนี้** — เวอร์ชันนี้เขียนคุกกี้ PKCE code-verifier ทันทีไม่ว่าจะเรียกจากฝั่งไหน
// (ดู src/... node_modules/@supabase/ssr/dist/main/cookies.js: setItem เช็ค key.endsWith("-code-verifier")
// แล้วเรียก applyServerStorage ทันที ไม่รอ auth event) เพราะฉะนั้นเรียกจาก Server Action ก็น่าจะ
// เขียนคุกกี้ได้ถูกต้องเหมือนกัน
//
// สาเหตุจริงของ error "PKCE code verifier not found in storage" ที่เจอ คือ **ทดสอบข้ามเบราว์เซอร์**
// (ขอลิงก์จาก Chrome โปรไฟล์ A แล้วไปกดลิงก์ในอีเมลที่เปิดจาก Chrome โปรไฟล์ B) — คุกกี้ code_verifier
// ถูกเก็บไว้ในเบราว์เซอร์ที่ขอลิงก์เท่านั้น (นี่คือกลไกความปลอดภัยของ PKCE ตั้งใจให้เป็นแบบนี้ ไม่ใช่บั๊ก)
// ทดสอบด้วยเบราว์เซอร์เดียวกันทั้งสองขั้นตอน (ขอลิงก์ + กดลิงก์ในอีเมล) แล้วใช้งานได้ปกติ ยืนยันแล้ว
// (2026-09-05) — คงเรียกที่ client ต่อไปเพราะไม่มีข้อเสีย ไม่ใช่เพราะจำเป็นต้องแก้บั๊กอะไร
export default function ForgotPasswordForm({ invalidLink }: { invalidLink: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "success">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });

    // ไม่บอกผู้ใช้ตรงๆ ว่าอีเมลนี้มีอยู่ในระบบจริงไหม (กัน enumeration) — โชว์ข้อความสำเร็จเสมอ
    // ไม่ว่าอีเมลจะมีอยู่จริงหรือไม่ ถ้ามี error จริงๆ (เช่น rate limit) แค่ log ไว้ฝั่ง console
    if (error) {
      console.error("ขอรีเซ็ตรหัสผ่านไม่สำเร็จ:", error.message);
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
        <h1 className="mb-2 text-xl font-bold">ตรวจสอบอีเมลของคุณ</h1>
        <p className="text-sm text-muted">
          ถ้ามีบัญชีที่ใช้อีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว
          กรุณาตรวจสอบกล่องขาเข้า (หรือโฟลเดอร์สแปม)
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-semibold text-ink hover:underline"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-sm">
      <h1 className="mb-2 text-center text-xl font-bold">ลืมรหัสผ่าน?</h1>
      <p className="mb-6 text-center text-sm text-muted">
        กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้
      </p>

      {invalidLink && (
        <p className="mb-4 rounded-lg bg-surface px-3.5 py-2.5 text-center text-sm text-muted">
          ลิงก์ตั้งรหัสผ่านใหม่หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่อีกครั้งด้านล่าง
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            required
            className="rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>

        <button
          type="submit"
          disabled={status === "pending"}
          className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "pending" ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
        </button>
      </form>
      <div className="my-6 border-t border-border" />
      <p className="text-center text-sm text-muted">
        นึกรหัสผ่านได้แล้ว?{" "}
        <Link href="/login" className="font-semibold text-ink hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
