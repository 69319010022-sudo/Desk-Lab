"use client";

import { useActionState } from "react";
import { updatePasswordAction, type UpdatePasswordState } from "@/lib/actions/auth";

const initialState: UpdatePasswordState = null;

export default function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 shadow-sm">
      <h1 className="mb-2 text-center text-xl font-bold">ตั้งรหัสผ่านใหม่</h1>
      <p className="mb-6 text-center text-sm text-muted">กรอกรหัสผ่านใหม่ที่ต้องการใช้เข้าสู่ระบบ</p>

      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            รหัสผ่านใหม่
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            autoComplete="new-password"
            required
            className="rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            ยืนยันรหัสผ่านใหม่
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            required
            className="rounded-lg border border-border px-3.5 py-2.5 text-sm outline-none focus:border-ink"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-[color:var(--color-status-cancelled)]/30 bg-surface px-3.5 py-2.5 text-sm text-[color:var(--color-status-cancelled)]">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "กำลังบันทึก..." : "ตั้งรหัสผ่านใหม่"}
        </button>
      </form>
    </div>
  );
}
