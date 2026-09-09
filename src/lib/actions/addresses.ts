"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AddressActionState = { error?: string; success?: boolean } | null;

function getStr(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  const str = typeof value === "string" ? value.trim() : "";
  return str === "" ? null : str;
}

// ใช้ทั้งตอนเพิ่มและแก้ไข — คืนค่าเดียวกัน (error หรือ success) เพื่อโชว์ผ่าน useActionState
function readAddressFields(formData: FormData) {
  return {
    label: getStr(formData, "label"),
    recipientName: getStr(formData, "recipientName"),
    phone: getStr(formData, "phone"),
    addressLine: getStr(formData, "addressLine"),
    subdistrict: getStr(formData, "subdistrict"),
    district: getStr(formData, "district"),
    province: getStr(formData, "province"),
    postalCode: getStr(formData, "postalCode"),
  };
}

export async function addAddressAction(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อน" };

  const fields = readAddressFields(formData);
  if (!fields.recipientName || !fields.phone || !fields.addressLine || !fields.province) {
    return { error: "กรุณากรอกชื่อผู้รับ เบอร์โทร ที่อยู่ และจังหวัดให้ครบ" };
  }

  // ที่อยู่แรกของผู้ใช้ ตั้งเป็นค่าเริ่มต้นให้อัตโนมัติ
  const { count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);
  const isFirstAddress = (count ?? 0) === 0;

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: fields.label ?? "ที่อยู่ใหม่",
    recipient_name: fields.recipientName,
    phone: fields.phone,
    address_line: fields.addressLine,
    subdistrict: fields.subdistrict,
    district: fields.district,
    province: fields.province,
    postal_code: fields.postalCode,
    is_default: isFirstAddress,
  });

  if (error) return { error: "เพิ่มที่อยู่ไม่สำเร็จ: " + error.message };

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true };
}

export async function updateAddressAction(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อน" };

  const addressId = Number(formData.get("addressId"));
  if (!addressId) return { error: "ไม่พบที่อยู่ที่ต้องการแก้ไข" };

  const fields = readAddressFields(formData);
  if (!fields.recipientName || !fields.phone || !fields.addressLine || !fields.province) {
    return { error: "กรุณากรอกชื่อผู้รับ เบอร์โทร ที่อยู่ และจังหวัดให้ครบ" };
  }

  const { error } = await supabase
    .from("addresses")
    .update({
      label: fields.label ?? "ที่อยู่",
      recipient_name: fields.recipientName,
      phone: fields.phone,
      address_line: fields.addressLine,
      subdistrict: fields.subdistrict,
      district: fields.district,
      province: fields.province,
      postal_code: fields.postalCode,
    })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) return { error: "บันทึกไม่สำเร็จ: " + error.message };

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return { success: true };
}

// ปุ่ม "ลบ" เป็น <form> ธรรมดา ไม่ต้องมี client state — ต้องคืนค่า void
export async function deleteAddressAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const addressId = Number(formData.get("addressId"));
  if (!addressId) return;

  await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

// ปุ่ม "ตั้งเป็นค่าเริ่มต้น" — ปิด default ของอันเก่าทั้งหมดก่อน แล้วค่อยตั้งอันใหม่
// (ตารางไม่มี unique constraint บังคับให้มี default แค่แถวเดียว จึงต้องทำ 2 ขั้นตอนนี้เอง)
export async function setDefaultAddressAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const addressId = Number(formData.get("addressId"));
  if (!addressId) return;

  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
