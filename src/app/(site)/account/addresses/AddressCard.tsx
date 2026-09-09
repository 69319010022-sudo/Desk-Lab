"use client";

import { useActionState, useState } from "react";
import {
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  type AddressActionState,
} from "@/lib/actions/addresses";
import type { Address } from "@/lib/data/addresses";

const initialState: AddressActionState = null;

const inputClass = "rounded-lg border border-border px-3 py-2 text-sm";

export default function AddressCard({ address }: { address: Address }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateAddressAction, initialState);

  // บันทึกสำเร็จ -> ปิดฟอร์มแก้ไข กลับไปโหมดแสดงผลปกติ
  // ปรับ state ระหว่าง render แทนการใช้ useEffect (กัน cascading render ตามคำแนะนำ React)
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.success) setEditing(false);
  }

  if (editing) {
    return (
      <form action={formAction} className="space-y-3 rounded-xl border border-border p-5">
        <input type="hidden" name="addressId" value={address.id} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            name="label"
            defaultValue={address.label ?? ""}
            placeholder="ป้ายกำกับ (เช่น บ้าน, ที่ทำงาน)"
            className={inputClass}
          />
          <input
            name="recipientName"
            defaultValue={address.recipientName ?? ""}
            placeholder="ชื่อผู้รับ"
            required
            className={inputClass}
          />
          <input
            name="phone"
            defaultValue={address.phone ?? ""}
            placeholder="เบอร์โทร"
            required
            className={inputClass}
          />
          <input
            name="addressLine"
            defaultValue={address.addressLine ?? ""}
            placeholder="ที่อยู่ (บ้านเลขที่, ถนน)"
            required
            className={`${inputClass} sm:col-span-2`}
          />
          <input
            name="subdistrict"
            defaultValue={address.subdistrict ?? ""}
            placeholder="ตำบล/แขวง"
            className={inputClass}
          />
          <input
            name="district"
            defaultValue={address.district ?? ""}
            placeholder="อำเภอ/เขต"
            className={inputClass}
          />
          <input
            name="province"
            defaultValue={address.province ?? ""}
            placeholder="จังหวัด"
            required
            className={inputClass}
          />
          <input
            name="postalCode"
            defaultValue={address.postalCode ?? ""}
            placeholder="รหัสไปรษณีย์"
            className={inputClass}
          />
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
            {pending ? "กำลังบันทึก..." : "บันทึก"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-surface"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    );
  }

  const detailLine = [
    address.addressLine,
    address.subdistrict,
    address.district,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-5">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{address.label || "ที่อยู่"}</p>
          {address.isDefault && (
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs text-muted">
              ค่าเริ่มต้น
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-muted">
          {address.recipientName} · {address.phone}
        </p>
        {detailLine && <p className="mt-0.5 text-sm text-muted">{detailLine}</p>}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-border px-4 py-2 text-xs font-medium transition-colors hover:bg-surface"
        >
          แก้ไข
        </button>
        <div className="flex gap-3">
          {!address.isDefault && (
            <form action={setDefaultAddressAction}>
              <input type="hidden" name="addressId" value={address.id} />
              <button type="submit" className="text-xs text-muted hover:underline">
                ตั้งเป็นค่าเริ่มต้น
              </button>
            </form>
          )}
          <form action={deleteAddressAction}>
            <input type="hidden" name="addressId" value={address.id} />
            <button
              type="submit"
              className="text-xs text-[color:var(--color-status-cancelled)] hover:underline"
            >
              ลบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
