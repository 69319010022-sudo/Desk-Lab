"use client";

import { useState, useTransition } from "react";
import { cancelOrderAction } from "@/lib/actions/orders";

const cancelReasons = [
  "เปลี่ยนใจ ไม่ต้องการสินค้าแล้ว",
  "ต้องการเปลี่ยนที่อยู่จัดส่ง",
  "ต้องการเปลี่ยนวิธีการชำระเงิน",
  "ต้องการเปลี่ยนสินค้า (สี/ขนาด/จำนวน)",
  "สั่งซื้อผิดพลาด (สินค้าหรือจำนวนไม่ถูกต้อง)",
  "พบสินค้าราคาถูกกว่าที่อื่น",
  "ใช้เวลาจัดส่งนานเกินไป",
  "อื่นๆ",
];

const OTHER_REASON = "อื่นๆ";

// ปรับสไตล์ตาม Figma (POS: border-subtle/bg-sunken/rounded-[10px]/[14px]) เท่านั้น —
// logic cancelOrderAction + โมดัลเลือกเหตุผลเดิมไม่ถูกแตะต้อง
export default function CancelOrderButton({ orderId }: { orderId: number }) {
  const [pending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherDetail, setOtherDetail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const resetAndClose = () => {
    setModalOpen(false);
    setSelectedReason(null);
    setOtherDetail("");
    setFormError(null);
  };

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setModalOpen(true)}
        className="rounded-[10px] border border-[color:var(--color-status-cancelled)] px-4 py-2 text-[13px] font-medium text-[color:var(--color-status-cancelled)] transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "กำลังยกเลิก..." : "ยกเลิกคำสั่งซื้อ"}
      </button>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={resetAndClose}
        >
          <div
            className="w-full max-w-md space-y-4 rounded-[14px] bg-background p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-[16px] font-semibold text-ink">ยกเลิกคำสั่งซื้อ</h3>
              <p className="mt-1 text-[12px] text-faint">
                กรุณาเลือกสาเหตุที่ต้องการยกเลิกคำสั่งซื้อนี้
              </p>
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {cancelReasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex cursor-pointer items-center gap-3 rounded-[10px] border p-3 text-[14px] transition-colors ${
                    selectedReason === reason
                      ? "border-ink"
                      : "border-subtle hover:bg-sunken"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={selectedReason === reason}
                    onChange={() => {
                      setSelectedReason(reason);
                      setFormError(null);
                    }}
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {selectedReason === OTHER_REASON && (
                <textarea
                  value={otherDetail}
                  onChange={(e) => setOtherDetail(e.target.value)}
                  placeholder="โปรดระบุสาเหตุเพิ่มเติม"
                  rows={3}
                  className="w-full rounded-[10px] border border-default px-3 py-2 text-[14px] outline-none focus:border-ink"
                />
              )}
            </div>

            {formError && (
              <p className="text-[12px] text-[color:var(--color-status-cancelled)]">{formError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="flex-1 rounded-[10px] border border-default py-2.5 text-[14px] font-medium transition-colors hover:bg-sunken"
              >
                ไม่ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedReason) {
                    setFormError("กรุณาเลือกสาเหตุการยกเลิก");
                    return;
                  }
                  if (selectedReason === OTHER_REASON && !otherDetail.trim()) {
                    setFormError("กรุณาระบุสาเหตุเพิ่มเติม");
                    return;
                  }
                  const reason =
                    selectedReason === OTHER_REASON
                      ? `อื่นๆ: ${otherDetail.trim()}`
                      : selectedReason;
                  setModalOpen(false);
                  startTransition(() => {
                    cancelOrderAction(orderId, reason);
                  });
                }}
                className="flex-1 rounded-[10px] bg-[color:var(--color-status-cancelled)] py-2.5 text-[14px] font-medium text-white transition-colors hover:opacity-90"
              >
                ยืนยันยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
