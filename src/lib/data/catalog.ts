import { createClient } from "@/lib/supabase/server";
import type { Category, Product, Review } from "@/lib/demo-data";

// ไฟล์นี้ดึงข้อมูล "แคตตาล็อกสินค้า" จริงจาก Supabase (categories, products, reviews)
// ใช้ได้เฉพาะใน Server Component เท่านั้น (เพราะ createClient จาก "@/lib/supabase/server"
// เป็น async และอ่าน cookies) — คืนค่าเป็น type เดียวกับที่ demo-data.ts เคยใช้
// (Category / Product / Review) เพื่อไม่ต้องแก้ component ที่มีอยู่แล้วเลย

// ตาราง products/categories/reviews เปิด RLS แบบอ่านได้สาธารณะ (ดู desklab_rls_policies.sql)
// จึงเรียกได้แม้ผู้เข้าชมยังไม่ได้ล็อกอิน

// ทุกฟังก์ชันห่อด้วย try/catch และคืนค่าว่าง (ไม่ throw) ถ้าต่อ Supabase ไม่ได้
// (เช่น เน็ตหลุด, ยังไม่ได้ตั้งค่า .env.local, Supabase project ล่ม) เพื่อไม่ให้
// ทั้งหน้าเว็บพังเพราะ query เดียว — แต่จะ log error ไว้ให้เห็นใน terminal ของ `npm run dev`

// Next.js ใช้ error แบบพิเศษภายในของตัวเอง (เช่นตอนตรวจพบว่าหน้านี้ต้องเป็น dynamic
// เพราะมีการเรียก cookies()) — error พวกนี้ "ห้ามกลืน" ต้อง throw ต่อไปให้ Next.js
// จัดการเอง ไม่งั้น Next.js จะจับสัญญาณไม่ได้ว่าหน้านี้ควร render แบบ dynamic
function rethrowIfNextInternal(err: unknown): void {
  if (err && typeof err === "object" && "digest" in err) {
    const digest = String((err as { digest?: unknown }).digest ?? "");
    if (digest.startsWith("DYNAMIC_SERVER_USAGE") || digest.startsWith("NEXT_")) {
      throw err;
    }
  }
}

function mapCategory(row: { id: number; name: string; slug: string }): Category {
  return { id: row.id, name: row.name, slug: row.slug };
}

type ProductRow = {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  sku: string;
  reviews?: { rating: number }[];
  product_images?: { image_url: string; sort_order: number }[];
};

function mapProduct(row: ProductRow): Product {
  const ratings = row.reviews?.map((r) => r.rating) ?? [];
  const reviewCount = ratings.length;
  const rating = reviewCount > 0 ? ratings.reduce((a, b) => a + b, 0) / reviewCount : 0;
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.image_url);

  return {
    id: row.id,
    categoryId: row.category_id ?? 0,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: Number(row.price),
    stockQuantity: row.stock_quantity,
    sku: row.sku,
    rating: Math.round(rating * 10) / 10,
    reviewCount,
    images,
  };
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id, name, slug").order("id");

    if (error) {
      console.error("getCategories error:", error.message);
      return [];
    }
    return data.map(mapCategory);
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getCategories failed:", err);
    return [];
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, price, stock_quantity, sku, product_images(image_url, sort_order)",
      )
      .eq("is_active", true)
      .order("id")
      .order("sort_order", { referencedTable: "product_images" });

    if (error) {
      console.error("getProducts error:", error.message);
      return [];
    }
    return data.map(mapProduct);
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getProducts failed:", err);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, price, stock_quantity, sku, reviews(rating), product_images(image_url, sort_order)",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .order("sort_order", { referencedTable: "product_images" })
      .maybeSingle();

    if (error) {
      console.error("getProductBySlug error:", error.message);
      return null;
    }
    if (!data) return null;
    return mapProduct(data as ProductRow);
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getProductBySlug failed:", err);
    return null;
  }
}

export async function getRelatedProducts(product: Product, count = 4): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, price, stock_quantity, sku, product_images(image_url, sort_order)",
      )
      .eq("category_id", product.categoryId)
      .eq("is_active", true)
      .neq("id", product.id)
      .order("sort_order", { referencedTable: "product_images" })
      .limit(count);

    if (error) {
      console.error("getRelatedProducts error:", error.message);
      return [];
    }
    return data.map(mapProduct);
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getRelatedProducts failed:", err);
    return [];
  }
}

// หมายเหตุสำคัญ: ตาราง reviews ไม่มีคอลัมน์ชื่อผู้เขียนรีวิวเก็บอยู่โดยตรง
// (มีแค่ user_id ที่อ้างอิงไปที่ตาราง users) และ RLS ของตาราง users อนุญาตให้
// แต่ละคนอ่านได้เฉพาะแถวของตัวเอง (users_select_own) เพื่อความเป็นส่วนตัว —
// จึงยังดึง "ชื่อผู้รีวิว" จริงมาโชว์แบบสาธารณะไม่ได้ในตอนนี้
// ใช้ป้ายชื่อกลางไปก่อน ("ลูกค้า DeskLab") จนกว่าจะออกแบบระบบเขียนรีวิวจริง
// (ทางเลือกตอนนั้น: เพิ่มคอลัมน์ author_name ลงในตาราง reviews ตอน insert รีวิวใหม่
// เพื่อไม่ต้องเปิดเผยข้อมูลตาราง users เพิ่ม)
export async function getReviewsForProduct(productId: number): Promise<Review[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, product_id, rating, comment, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("getReviewsForProduct error:", error.message);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      productId: row.product_id,
      authorName: "ลูกค้า DeskLab",
      rating: row.rating,
      comment: row.comment ?? "",
      createdAt: new Date(row.created_at).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    }));
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getReviewsForProduct failed:", err);
    return [];
  }
}

export function getCategoryById(categories: Category[], id: number): Category | undefined {
  return categories.find((c) => c.id === id);
}
