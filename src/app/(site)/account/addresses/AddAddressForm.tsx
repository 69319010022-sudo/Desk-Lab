"use client";

import { useActionState, useState } from "react";
import { addAddressAction, type AddressActionState } from "@/lib/actions/addresses";

const initialState: AddressActionState = null;

const inputClass = "rounded-lg border border-border px-3 py-2 text-sm";

export default function AddAddressForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addAddressAction, initialState);

  // เพิ่มสำเร็จ -> ปิดฟอร์ม (เปิดใหม่ครั้งหน้าจะเป็นฟอร์มเปล่าเพราะ unmount ไปแล้ว)
  // ปรับ state ระหว่าง render แทนการใช้ useEffect (กัน cascading render ตามคำแนะนำ React)
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-border py-3 text-sm font-medium text-muted transition-colors hover:bg-surface"
      >
        + เพิ่มที่อยู่ใหม่
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-border p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input name="label" placeholder="ป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)" className={inputClass} />
        <input name="recipientName" placeholder="ชื่อผู้รับ" required className={inputClass} />
        <input name="phone" placeholder="เบอร์โทร" required className={inputClass} />
        <input
          name="addressLine"
          placeholder="ที่อยู่ (บ้านเลขที่, ถนน)"
          required
          className={`${inputClass} sm:col-span-2`}
        />
        <input name="subdistrict" placeholder="ตำบล/แขวง" className={inputClass} />
        <input name="district" placeholder="อำเภอ/เขต" className={inputClass} />
        <input name="province" placeholder="จังหวัด" required className={inputClass} />
        <input name="postalCode" placeholder="รหัสไปรษณีย์" className={inputClass} />
      </div>
      {state?.error && (
        <p className="text-xs text-[color:var(--color-status-cancelled)]">{state.error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-white disabled:opacity-60"
        >
          {pending ? "กำลังบันทึก..." : "บันทึกที่อยู่"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-surface"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
