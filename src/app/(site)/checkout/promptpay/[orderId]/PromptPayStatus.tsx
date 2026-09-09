"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  checkPromptPayStatusAction,
  getOrCreatePromptPayQrAction,
  type PaymentStatusResult,
  type PromptPayQrResult,
} from "@/lib/actions/payments";

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// นับถอยหลังจนถึงเวลาจริง (epoch ms) แทนการลดทีละ 1 จากค่าคงที่ — ทำให้เวลานับถอยหลังตรงกับ
// เวลาหมดอายุจริงของ Opn เสมอ ไม่ว่าจะโหลดหน้าซ้ำ สลับแท็บ หรือเครื่องหน่วงแค่ไหนก็ตาม
function secondsUntil(target: number) {
  return Math.max(0, Math.round((target - Date.now()) / 1000));
}

export default function PromptPayStatus({
  orderId,
  initialResult,
}: {
  orderId: number;
  initialResult: PromptPayQrResult;
}) {
  const router = useRouter();
  const [result, setResult] = useState<PromptPayQrResult>(initialResult);
  const expiresAtMs = result.ok && result.expiresAt ? new Date(result.expiresAt).getTime() : null;
  // ตัวนับนี้ไม่ได้เก็บเวลาที่เหลือเอง แค่ใช้กระตุ้นให้ re-render ทุกวินาที — เวลาที่เหลือจริงคำนวณสดๆ
  // จาก expiresAtMs - Date.now() ตอน render แต่ละครั้งด้านล่าง เพื่อไม่ให้เพี้ยนไปจากเวลาหมดอายุจริง
  const [, setTick] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checking, startChecking] = useTransition();
  const [regenerating, startRegenerating] = useTransition();
  const syncedExpiryRef = useRef(false);

  const isPendingQr = result.ok && result.status === "pending";
  const secondsLeft = expiresAtMs ? secondsUntil(expiresAtMs) : 0;

  useEffect(() => {
    if (!isPendingQr || !expiresAtMs) return;
    syncedExpiryRef.current = false;
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, [isPendingQr, expiresAtMs]);

  // เวลาหมดจริง (ไม่ใช่แค่ UI ซ่อน QR) — ยิงเช็คสถานะกับเซิร์ฟเวอร์ทันทีครั้งเดียวเพื่อ mark
  // payment_status เป็น failed ฝั่ง DB ด้วย กัน QR เดิมไว้กดจ่ายไม่ได้จริงแม้จะรีเฟรชหน้า
  useEffect(() => {
    if (!isPendingQr || secondsLeft > 0 || syncedExpiryRef.current) return;
    syncedExpiryRef.current = true;
    checkPromptPayStatusAction(orderId).then((r) => {
      if (r.ok && r.status !== "pending" && r.status !== "successful") {
        setResult((prev) => (prev.ok ? { ...prev, status: r.status } : prev));
      }
    });
  }, [isPendingQr, secondsLeft, orderId]);

  function regenerate() {
    startRegenerating(async () => {
      const r = await getOrCreatePromptPayQrAction(orderId);
      setResult(r);
      setStatusMessage(null);
    });
  }

  if (!result.ok) {
    return (
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border p-6 text-center">
        <p className="text-sm text-[color:var(--color-status-cancelled)]">{result.error}</p>
        <button
          type="button"
          disabled={regenerating}
          onClick={regenerate}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {regenerating ? "กำลังลองใหม่..." : "ลองสร้าง QR อีกครั้ง"}
        </button>
      </div>
    );
  }

  if (result.status === "successful") {
    return (
      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-[color:var(--color-status-delivered)]/30 bg-surface p-6 text-center">
        <p className="text-base font-bold text-[color:var(--color-status-delivered)]">ชำระเงินสำเร็จแล้ว</p>
        <button
          type="button"
          onClick={() => router.push(`/account/orders/${orderId}`)}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          ดูคำสั่งซื้อ
        </button>
      </div>
    );
  }

  const expired = secondsLeft <= 0 || result.status === "expired" || result.status === "failed";

  return (
    <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border p-6 text-center">
      <p className="text-xs text-muted">
        สแกน QR นี้ด้วยแอปธนาคารเพื่อชำระเงิน (โหมดทดสอบ Opn Payments — ไม่มีการตัดเงินจริง)
      </p>

      {!expired && result.qrImageDataUri ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result.qrImageDataUri}
          alt="PromptPay QR"
          className="mx-auto h-48 w-48 rounded-lg bg-white p-2 shadow-inner"
        />
      ) : (
        <p className="text-sm font-medium text-[color:var(--color-status-cancelled)]">QR หมดอายุแล้ว</p>
      )}

      {!expired && (
        <p className="text-sm text-muted">
          กรุณาชำระเงินภายใน{" "}
          <span className="font-semibold text-[color:var(--color-status-cancelled)]">
            {formatCountdown(secondsLeft)}
          </span>{" "}
          นาที
        </p>
      )}

      {statusMessage && <p className="text-xs text-muted">{statusMessage}</p>}

      <div className="flex flex-col gap-2">
        {!expired && (
          <button
            type="button"
            disabled={checking}
            onClick={() => {
              setStatusMessage(null);
              startChecking(async () => {
                const r: PaymentStatusResult = await checkPromptPayStatusAction(orderId);
                if (!r.ok) {
                  setStatusMessage(r.error);
                } else if (r.status === "successful") {
                  setResult({ ok: true, qrImageDataUri: null, status: "successful", expiresAt: null });
                } else if (r.status === "pending") {
                  setStatusMessage("ยังไม่พบการชำระเงิน กรุณาสแกนจ่ายแล้วลองตรวจสอบอีกครั้ง");
                } else {
                  setResult({ ...result, status: r.status });
                  setStatusMessage("การชำระเงินไม่สำเร็จหรือหมดอายุ กรุณาสร้าง QR ใหม่");
                }
              });
            }}
            className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? "กำลังตรวจสอบ..." : "ตรวจสอบสถานะการชำระเงิน"}
          </button>
        )}

        {expired && (
          <button
            type="button"
            disabled={regenerating}
            onClick={regenerate}
            className="w-full rounded-lg border border-border py-3 text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            {regenerating ? "กำลังสร้าง..." : "สร้าง QR ใหม่"}
          </button>
        )}
      </div>
    </div>
  );
}
