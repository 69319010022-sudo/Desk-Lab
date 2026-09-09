"use client";

import { useActionState } from "react";
import { confirmPasswordResetAction, type ConfirmRecoveryState } from "@/lib/actions/auth";

const initialState: ConfirmRecoveryState = null;

export default function ConfirmRecoveryForm({ code, next }: { code: string; next: string }) {
  const [state, formAction, isPending] = useActionState(confirmPasswordResetAction, initialState);

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-background p-8 text-center shadow-sm">
      <h1 className="mb-2 text-xl font-bold">ยืนยันการตั้งรหัสผ่านใหม่</h1>
      <p className="mb-6 text-sm text-muted">กดปุ่มด้านล่างเพื่อดำเนินการตั้งรหัสผ่านใหม่ต่อ</p>
      {state?.error && (
        <p className="mb-4 rounded-lg border border-[color:var(--color-status-cancelled)]/30 bg-surface px-3.5 py-2.5 text-left text-xs text-[color:var(--color-status-cancelled)]">
          {state.error}
        </p>
      )}
      <form action={formAction}>
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "กำลังดำเนินการ..." : "ดำเนินการต่อ"}
        </button>
      </form>
    </div>
  );
}
