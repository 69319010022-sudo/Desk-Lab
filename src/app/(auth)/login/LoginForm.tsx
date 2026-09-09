"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, type AuthActionState } from "@/lib/actions/auth";
import PasswordInput from "@/components/PasswordInput";

const initialState: AuthActionState = null;

// Login ปรับสไตล์ตาม Figma จริง (get_design_context, node-id=1:450 "06 · Login — POS",
// fileKey UqD5VwG7M7IFPZMoFuoSo2) — คงฟอร์มเดิมที่ต่อ Supabase Auth จริงไว้ทั้งหมดโดยไม่
// แตะต้อง (useActionState(signInAction) + PasswordInput ที่มีปุ่มแสดง/ซ่อนอยู่แล้ว ผ่านการ
// ทดสอบจริงแล้ว) เปลี่ยนแค่สไตล์การ์ดให้เข้าธีม POS (การ์ดขอบมน 14px ใหญ่ขึ้น มีหัวข้อ+คำโปรย)
// — (auth)/layout.tsx มี header เรียบง่าย + จัดกึ่งกลางให้อยู่แล้ว ไม่ต้องมี Rail แบบหน้าร้าน
// เพราะหน้า login/register เป็น flow แยกต่างหาก
export default function LoginForm({
  justRegistered,
  justResetPassword,
}: {
  justRegistered: boolean;
  justResetPassword?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-[32px] font-semibold tracking-[-0.4px] text-ink">DeskLab</h1>
        <p className="mt-2 text-[14px] text-muted">
          ระบบร้านค้าออนไลน์สำหรับของแต่งโต๊ะทำงาน
        </p>
      </div>

      <div className="w-[400px] rounded-[14px] border border-subtle bg-background p-10">
        <div className="mb-6">
          <h2 className="text-[24px] font-semibold tracking-[-0.2px] text-ink">เข้าสู่ระบบ</h2>
          <p className="mt-2 text-[14px] text-muted">ยินดีต้อนรับกลับมาที่ DeskLab</p>
        </div>

        {justRegistered && (
          <p className="mb-4 rounded-lg bg-sunken px-3.5 py-2.5 text-center text-sm text-muted">
            สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ (หากเปิดใช้การยืนยันอีเมล กรุณายืนยันในอีเมลก่อน)
          </p>
        )}

        {justResetPassword && (
          <p className="mb-4 rounded-lg bg-sunken px-3.5 py-2.5 text-center text-sm text-muted">
            ตั้งรหัสผ่านใหม่สำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
          </p>
        )}

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[13px] font-medium text-muted">
              อีเมล
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
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
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-muted transition hover:text-ink"
            >
              ลืมรหัสผ่าน?
            </Link>
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
            {isPending ? "⏳ กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[14px] text-muted">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="font-medium text-ink hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
