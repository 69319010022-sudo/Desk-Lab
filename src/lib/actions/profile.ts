"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fireAndForgetLog } from "@/lib/actions/logging";

export type ProfileActionState = { error?: string; success?: boolean } | null;

// ชื่อผู้ใช้ (username) — ต้องตรงกับ CHECK constraint users_name_format_check บน
// public.users.name (migration enforce_username_format_and_uniqueness, 2026-09-05)
const USERNAME_PATTERN = /^[A-Za-z0-9_.]{3,30}$/;

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) {
    return { error: "กรุณากรอกชื่อผู้ใช้" };
  }
  if (!USERNAME_PATTERN.test(name)) {
    return { error: "ชื่อผู้ใช้ต้องเป็น a-z, 0-9, _ หรือ . เท่านั้น ความยาว 3-30 ตัวอักษร" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" };
  }

  // RLS: policy users_update_own อนุญาตให้แก้ได้เฉพาะแถวที่ auth.uid() = id ของตัวเอง
  const { error } = await supabase
    .from("users")
    .update({ name, phone: phone || null })
    .eq("id", user.id);

  if (error) {
    // ชนกับ UNIQUE constraint (users_name_unique) แปลว่ามีคนใช้ชื่อผู้ใช้นี้ไปแล้ว
    if (error.message.toLowerCase().includes("duplicate key") || error.code === "23505") {
      return { error: "ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว กรุณาเลือกชื่ออื่น" };
    }
    return { error: "บันทึกไม่สำเร็จ: " + error.message };
  }

  // Log profile update
  fireAndForgetLog(user.id, "profile.updated", "users", user.id, { name, phone });

  revalidatePath("/account/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

export type UploadAvatarState = { error?: string; success?: boolean } | null;

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

// อัปโหลดรูปโปรไฟล์ขึ้น Supabase Storage bucket "avatars" (ต้องสร้าง bucket + policy ก่อน —
// ดู desklab-plan.md) เก็บไฟล์ที่ path "<user.id>/avatar.<นามสกุล>" เดียวเสมอ (upsert: true
// ทับไฟล์เดิม ไม่สะสมไฟล์ขยะ) แล้วบันทึก public URL ลง users.avatar_url
export async function uploadAvatarAction(
  _prevState: UploadAvatarState,
  formData: FormData,
): Promise<UploadAvatarState> {
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "กรุณาเลือกไฟล์รูปภาพ" };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "รองรับเฉพาะไฟล์รูปภาพเท่านั้น" };
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return { error: "ไฟล์ต้องมีขนาดไม่เกิน 2MB" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    return { error: "อัปโหลดไม่สำเร็จ: " + uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);
  // แปะ ?v= ต่อท้าย กัน browser cache รูปเก่าไว้ (path เดิมทุกครั้งเพราะ upsert ทับไฟล์เดิม)
  const avatarUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: dbError } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (dbError) {
    return { error: "บันทึกไม่สำเร็จ: " + dbError.message };
  }

  // Log avatar upload
  fireAndForgetLog(user.id, "profile.avatar_uploaded", "users", user.id, { fileName: file.name });

  revalidatePath("/account/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

export type DeleteAvatarState = { error?: string; success?: boolean } | null;

// ลบรูปโปรไฟล์จาก Supabase Storage และล้าง avatar_url ในฐานข้อมูล
export async function deleteAvatarAction(): Promise<DeleteAvatarState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง" };
  }

  // ดึง avatar_url ปัจจุบันเพื่อหาชื่อไฟล์
  const { data: userData, error: selectError } = await supabase
    .from("users")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (selectError || !userData?.avatar_url) {
    return { error: "ไม่พบรูปโปรไฟล์ที่จะลบ" };
  }

  // ดึง path จาก URL (ลบ query string และ domain)
  const url = new URL(userData.avatar_url);
  const path = url.pathname.split("/storage/v1/object/public/avatars/")[1];

  if (!path) {
    return { error: "ไม่สามารถหาไฟล์รูปภาพได้" };
  }

  // ลบไฟล์จาก Storage
  const { error: deleteError } = await supabase.storage
    .from("avatars")
    .remove([path]);

  if (deleteError) {
    return { error: "ลบไฟล์ไม่สำเร็จ: " + deleteError.message };
  }

  // ล้าง avatar_url ในฐานข้อมูล
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (updateError) {
    return { error: "บันทึกไม่สำเร็จ: " + updateError.message };
  }

  // Log avatar deletion
  fireAndForgetLog(user.id, "profile.avatar_deleted", "users", user.id);

  revalidatePath("/account/profile");
  revalidatePath("/", "layout");
  return { success: true };
}