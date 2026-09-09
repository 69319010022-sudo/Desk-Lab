"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction, type AuthActionState } from "@/lib/actions/auth";
import PasswordInput from "@/components/PasswordInput";

const initialState: AuthActionState = null;

// Register ปรับสไตล์ตาม Figma POS-style UI (หน้า 7/9 "07 · Register") — คงฟอร์มเดิมที่ต่อ
// Supabase Auth จริงไว้ทั้งหมดโดยไม่แตะต้อง (useActionState(signUpAction) + PasswordInput
// ที่มีปุ่มแสดง/ซ่อนอยู่แล้ว ผ่านการทดสอบจริงแล้วตามหน้า Auth ใน desklab-plan.md) เปลี่ยนแค่
// สไตล์การ์ดให้เข้าธีม POS แบบเดียวกับ LoginForm.tsx (การ์ดขอบมน 14px กว้าง 400px มีหัวข้อ+
// คำโปรยด้านบน) ฟิลด์ "เบอร์โทรศัพท์" (phone) เป็นของจริงที่มีอยู่แล้วในฟอร์มเดิม (ไม่ได้อยู่ใน
// ไฟล์อ้างอิงจาก Figma) จึงคงไว้และจัดสไตล์ให้เข้าชุดเดียวกัน
export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-[32px] font-semibold tracking-[-0.4px] text-ink">DeskLab</h1>
        <p className="mt-2 text-[14px] text-muted">สร้างบัญชีใหม่เพื่อเริ่มช้อปกับ DeskLab</p>
      </div>

      <div className="w-[400px] rounded-[14px] border border-subtle bg-background p-10">
        <div className="mb-6">
          <h2 className="text-[24px] font-semibold tracking-[-0.2px] text-ink">สมัครสมาชิก</h2>
          <p className="mt-2 text-[14px] text-muted">ใช้เวลาไม่ถึงนาที เริ่มช้อปได้ทันที</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-[13px] font-medium text-muted">
              ชื่อผู้ใช้
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="เช่น top123"
              autoComplete="username"
              required
              pattern="[A-Za-z0-9_.]{3,30}"
              maxLength={30}
              className="h-[44px] w-full rounded-[10px] border border-default bg-background px-[14px] text-[14px] outline-none transition focus:border-ink"
            />
            <p className="text-[12px] text-faint">
              ใช้ตัวอักษร a-z, ตัวเลข, _ หรือ . เท่านั้น ความยาว 3-30 ตัวอักษร
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-muted">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              autoComplete="email"
              required
              className="h-[44px] w-full rounded-[10px] border border-default bg-background px-[14px] text-[14px] outline-none transition focus:border-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-[13px] font-medium text-muted">
              เบอร์โทรศัพท์ <span className="text-faint">(ไม่บังคับ)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="080-123-4567"
              autoComplete="tel"
              className="h-[44px] w-full rounded-[10px] border border-default bg-background px-[14px] text-[14px] outline-none transition focus:border-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] font-medium text-muted">
              รหัสผ่าน
            </label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmPassword" className="text-[13px] font-medium text-muted">
              ยืนยันรหัสผ่าน
            </label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              autoComplete="new-password"
              required
            />
          </div>

          {state?.error && (
            <p className="rounded-lg border border-[color:var(--color-status-cancelled)]/30 bg-sunken px-3.5 py-2.5 text-sm text-[color:var(--color-status-cancelled)]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-[44px] w-full rounded-[10px] bg-ink text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "⏳ กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[14px] text-muted">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="font-medium text-ink hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
