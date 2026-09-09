"use client";

import { startTransition, useActionState, useState } from "react";
import {
  updateProfileAction,
  uploadAvatarAction,
  type ProfileActionState,
  type UploadAvatarState,
} from "@/lib/actions/profile";
import type { CurrentUser } from "@/lib/data/auth";
import AvatarCropModal from "@/components/AvatarCropModal";

const initialState: ProfileActionState = null;
const avatarInitialState: UploadAvatarState = null;

// ปรับสไตล์ตาม Figma (POS Profile) — คงฟอร์มเดิมที่ต่อ Supabase จริงไว้ทั้งหมด
// (useActionState(updateProfileAction) + useActionState(uploadAvatarAction) +
// AvatarCropModal flow) เปลี่ยนแค่สไตล์การ์ด/อินพุตให้เข้าธีม POS (โทเคนชุดใหม่
// border-subtle/bg-sunken/text-faint ตามที่ใช้ใน Login/Register/Cart) — แยกเป็น
// การ์ดรูปโปรไฟล์ + การ์ดฟอร์มข้อมูล ตามดีไซน์อ้างอิงจาก Figma
export default function ProfileForm({ user }: { user: CurrentUser }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);
  const [avatarState, avatarFormAction, avatarPending] = useActionState(
    uploadAvatarAction,
    avatarInitialState,
  );
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  function closeCropModal() {
    if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
    setCropImageSrc(null);
  }

  function handleCropConfirm(blob: Blob) {
    closeCropModal();
    const formData = new FormData();
    formData.set("avatar", blob, "avatar.jpg");
    startTransition(() => {
      avatarFormAction(formData);
    });
  }

  return (
    <div className="flex flex-col gap-6">
        {/* การ์ดรูปโปรไฟล์ */}
        <div className="rounded-[14px] border border-subtle bg-sunken p-6">
          <div className="flex items-center gap-6">
            {user.avatarUrl ? (
              // URL จาก Supabase Storage ตรงๆ ไม่ได้ตั้ง remotePatterns ใน next.config.ts ไว้
              // ใช้ img ธรรมดาไปก่อน (แค่ warning เรื่อง LCP ไม่ใช่ error)
              <img
                src={user.avatarUrl}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-subtle text-faint">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}

            <div className="flex-1">
              <h4 className="text-[16px] font-medium text-ink">รูปโปรไฟล์</h4>
              <p className="mt-1 text-[12px] text-faint">รองรับไฟล์รูปภาพ ขนาดไม่เกิน 2MB</p>
              <label
                htmlFor="avatar"
                className="mt-4 inline-block cursor-pointer rounded-[10px] border border-default bg-background px-6 py-2 text-[14px] font-medium text-ink transition hover:bg-subtle"
              >
                {avatarPending ? "กำลังอัปโหลด..." : "เปลี่ยนรูป"}
              </label>
              <input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={avatarPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  setCropImageSrc(URL.createObjectURL(file));
                }}
              />
            </div>
          </div>

          {avatarState?.error && (
            <p className="mt-4 rounded-[10px] border border-[color:var(--color-status-cancelled)]/30 bg-background px-3.5 py-2.5 text-sm text-[color:var(--color-status-cancelled)]">
              {avatarState.error}
            </p>
          )}

          {cropImageSrc && (
            <AvatarCropModal
              imageSrc={cropImageSrc}
              onCancel={closeCropModal}
              onConfirm={handleCropConfirm}
            />
          )}
        </div>

        {/* การ์ดฟอร์มข้อมูล */}
        <div className="rounded-[14px] border border-subtle bg-background p-7">
          <form action={formAction} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-[13px] font-medium text-muted">
                ชื่อผู้ใช้
              </label>
              <input
                id="name"
                name="name"
                defaultValue={user.name ?? ""}
                placeholder="เช่น top123"
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
                defaultValue={user.email}
                disabled
                className="h-[44px] w-full rounded-[10px] border border-default bg-sunken px-[14px] text-[14px] text-muted outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-[13px] font-medium text-muted">
                เบอร์โทรศัพท์
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={user.phone ?? ""}
                placeholder="08X-XXX-XXXX"
                className="h-[44px] w-full rounded-[10px] border border-default bg-background px-[14px] text-[14px] outline-none transition focus:border-ink"
              />
            </div>

            {state?.error && (
              <p className="rounded-[10px] border border-[color:var(--color-status-cancelled)]/30 bg-sunken px-3.5 py-2.5 text-sm text-[color:var(--color-status-cancelled)]">
                {state.error}
              </p>
            )}
            {state?.success && (
              <p className="rounded-[10px] border border-[color:var(--color-status-delivered)]/30 bg-sunken px-3.5 py-2.5 text-sm text-[color:var(--color-status-delivered)]">
                บันทึกข้อมูลเรียบร้อยแล้ว
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="h-[44px] w-fit rounded-[10px] bg-ink px-8 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "⏳ กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </button>
          </form>
        </div>
      </div>
  );
}
