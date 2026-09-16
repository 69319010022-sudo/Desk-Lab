"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Server Actions สำหรับ Product Management (ขั้นตอนที่ 6) — CRUD สินค้า + หมวดหมู่
// ใช้คู่กับ useActionState ฝั่ง Client Component (ดู ProductFormModal.tsx, CategoryPanel.tsx)
// ทุก insert/update/delete พึ่ง RLS policy admin (products_admin_all, categories_admin_all,
// product_images_admin_all) ที่เปิดไว้ตั้งแต่ขั้นตอนที่ 3 — เรียกจากบัญชีที่ไม่ใช่แอดมินจะ
// โดน RLS ปฏิเสธเอง (0 แถวถูกกระทบ ไม่ error แต่ก็ไม่มีอะไรเกิดขึ้น)

// สำคัญ: order_items_product_id_fkey เป็น ON DELETE RESTRICT — ลบสินค้าที่เคยถูกสั่งซื้อ
// แล้วไม่ได้เด็ดขาด ต้องดักจับ error code 23503 แล้วแนะนำให้ "ปิดการขาย" แทน (ดูรายละเอียด
// การเช็ค FK ทั้งหมดใน desklab-plan.md ขั้นตอนที่ 6)

export type AdminActionState = { error?: string; success?: boolean } | null;

const SLUG_PATTERN = /^[a-z0-9-]+$/;

function parseNumber(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function createProductAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parseNumber(formData.get("price"));
  const stockQuantity = parseNumber(formData.get("stock_quantity"));
  const categoryIdRaw = String(formData.get("category_id") ?? "");
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!name || !slug || !sku) {
    return { error: "กรุณากรอกชื่อสินค้า, slug และ SKU ให้ครบ" };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return { error: "slug ต้องเป็นตัวพิมพ์เล็ก a-z, 0-9 และ - เท่านั้น" };
  }
  if (price < 0 || stockQuantity < 0) {
    return { error: "ราคาและจำนวนสต็อกต้องไม่ติดลบ" };
  }

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      sku,
      description,
      price,
      stock_quantity: stockQuantity,
      category_id: categoryId,
      is_active: isActive,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "slug หรือ SKU นี้ถูกใช้ไปแล้ว กรุณาเปลี่ยนใหม่" };
    }
    console.error("createProductAction error:", error.message);
    return { error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" };
  }

  if (imageUrl && product) {
    const { error: imageError } = await supabase
      .from("product_images")
      .insert({ product_id: product.id, image_url: imageUrl, sort_order: 0 });
    if (imageError) console.error("createProductAction image error:", imageError.message);
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateProductAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = parseNumber(formData.get("price"));
  const stockQuantity = parseNumber(formData.get("stock_quantity"));
  const categoryIdRaw = String(formData.get("category_id") ?? "");
  const categoryId = categoryIdRaw ? Number(categoryIdRaw) : null;
  const imageUrl = String(formData.get("image_url") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!id) return { error: "ไม่พบสินค้าที่จะแก้ไข" };
  if (!name || !slug || !sku) {
    return { error: "กรุณากรอกชื่อสินค้า, slug และ SKU ให้ครบ" };
  }
  if (!SLUG_PATTERN.test(slug)) {
    return { error: "slug ต้องเป็นตัวพิมพ์เล็ก a-z, 0-9 และ - เท่านั้น" };
  }
  if (price < 0 || stockQuantity < 0) {
    return { error: "ราคาและจำนวนสต็อกต้องไม่ติดลบ" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      sku,
      description,
      price,
      stock_quantity: stockQuantity,
      category_id: categoryId,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "slug หรือ SKU นี้ถูกใช้ไปแล้ว กรุณาเปลี่ยนใหม่" };
    }
    console.error("updateProductAction error:", error.message);
    return { error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" };
  }

  // แทนที่รูปเดิมทั้งหมดด้วยรูปใหม่ (ง่ายกว่าเช็คว่าเปลี่ยนหรือไม่ — ตอนนี้มีแค่รูปเดียวต่อสินค้า)
  await supabase.from("product_images").delete().eq("product_id", id);
  if (imageUrl) {
    const { error: imageError } = await supabase
      .from("product_images")
      .insert({ product_id: id, image_url: imageUrl, sort_order: 0 });
    if (imageError) console.error("updateProductAction image error:", imageError.message);
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProductAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = Number(formData.get("id"));
  if (!id) return { error: "ไม่พบสินค้าที่จะลบ" };

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: "ลบไม่ได้ เพราะสินค้านี้เคยถูกสั่งซื้อไปแล้ว — กรุณา \"ปิดการขาย\" แทนการลบ",
      };
    }
    console.error("deleteProductAction error:", error.message);
    return { error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductActiveAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const nextActive = formData.get("next_active") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").update({ is_active: nextActive }).eq("id", id);
  revalidatePath("/admin/products");
}

export async function createCategoryAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!name || !slug) return { error: "กรุณากรอกชื่อหมวดหมู่" };
  if (!SLUG_PATTERN.test(slug)) {
    return { error: "slug ต้องเป็นตัวพิมพ์เล็ก a-z, 0-9 และ - เท่านั้น" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({ name, slug });

  if (error) {
    if (error.code === "23505") return { error: "หมวดหมู่นี้มีอยู่แล้ว (ชื่อหรือ slug ซ้ำ)" };
    console.error("createCategoryAction error:", error.message);
    return { error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateCategoryAction(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();

  if (!id) return { error: "ไม่พบหมวดหมู่ที่จะแก้ไข" };
  if (!name) return { error: "กรุณากรอกชื่อหมวดหมู่" };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ name }).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "ชื่อหมวดหมู่นี้ถูกใช้ไปแล้ว" };
    console.error("updateCategoryAction error:", error.message);
    return { error: "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

// ปลอดภัยเสมอ — products_category_id_fkey เป็น ON DELETE SET NULL ยืนยันแล้วจาก DB จริง
// (สินค้าที่อยู่ในหมวดนี้จะกลายเป็น category_id = null "ไม่มีหมวดหมู่" อัตโนมัติ ไม่ error)
export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/products");
}
