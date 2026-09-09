"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CartActionState = { error?: string; success?: boolean } | null;

// carts มี 1 แถวต่อผู้ใช้ 1 คน แต่ไม่ได้สร้างตอนสมัครสมาชิก (ต่างจาก public.users ที่มี
// trigger สร้างอัตโนมัติ) — ตะกร้าจะถูกสร้างแบบ lazy ตอนกด "เพิ่มลงตะกร้า" ครั้งแรกเท่านั้น
export async function getOrCreateCartId(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

// ฟังก์ชันหลัก คืนค่า error/success กลับมาให้เรียกใช้ต่อได้ 2 แบบด้านล่าง
async function performAddToCart(formData: FormData): Promise<CartActionState> {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);

  if (!productId) return { error: "ไม่พบสินค้าที่ต้องการเพิ่ม" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ยังไม่ล็อกอิน — พาไปหน้า login เลย (ระบบนี้ไม่มีตะกร้าแบบ guest)
  if (!user) redirect("/login");

  const cartId = await getOrCreateCartId(supabase, user.id);

  // ถ้ามีสินค้านี้ในตะกร้าอยู่แล้ว บวกจำนวนเพิ่มแทนการสร้างแถวซ้ำ
  const { data: existingItem } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existingItem) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id);
    if (error) return { error: "เพิ่มสินค้าไม่สำเร็จ: " + error.message };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, product_id: productId, quantity });
    if (error) return { error: "เพิ่มสินค้าไม่สำเร็จ: " + error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

// เวอร์ชันคู่กับ useActionState (หน้ารายละเอียดสินค้า ที่โชว์ error/loading ได้ละเอียดกว่า)
export async function addToCartAction(
  _prevState: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  return performAddToCart(formData);
}

// เวอร์ชันสำหรับ <form action={...}> ธรรมดา (เช่นปุ่ม "เพิ่มลงตะกร้า" ใน ProductCard)
// ต้องคืนค่า void เพราะ <form action> ของ React ไม่รับฟังก์ชันที่คืนค่าอย่างอื่น —
// ไม่โชว์ error ละเอียด แต่ยังคง revalidate ให้จำนวนในตะกร้า/Navbar อัปเดตตามปกติ
export async function addToCart(formData: FormData): Promise<void> {
  await performAddToCart(formData);
}

// ปุ่ม +/− ในหน้าตะกร้า ส่งจำนวนใหม่ที่คำนวณไว้แล้วมาให้เลย (คำนวณที่ฝั่งเซิร์ฟเวอร์ตอน
// render หน้าตะกร้า) ถ้าจำนวนใหม่ <= 0 คือลบแถวทิ้ง — เป็น <form> ธรรมดา ไม่ต้องมี client state
export async function updateCartItemQuantity(formData: FormData): Promise<void> {
  const cartItemId = Number(formData.get("cartItemId"));
  const quantity = Number(formData.get("quantity"));
  if (!cartItemId) return;

  const supabase = await createClient();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", cartItemId);
  } else {
    await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId);
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function removeCartItem(formData: FormData): Promise<void> {
  const cartItemId = Number(formData.get("cartItemId"));
  if (!cartItemId) return;

  const supabase = await createClient();
  await supabase.from("cart_items").delete().eq("id", cartItemId);

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

// ปุ่ม "ล้างตะกร้า" ในหน้า Cart — ลบสินค้าทั้งหมดในตะกร้าของผู้ใช้ปัจจุบันทีเดียว
// เป็น <form> ธรรมดาเหมือนฟังก์ชันอื่นในไฟล์นี้ ไม่ต้องมี client state
export async function clearCart(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (cart) {
    await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
