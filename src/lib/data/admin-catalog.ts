import { createClient } from "@/lib/supabase/server";

// ไฟล์นี้ดึงข้อมูลสินค้า/หมวดหมู่ "ทั้งหมด" (รวมที่ปิดการขาย) สำหรับหน้า Admin Product
// Management (ขั้นตอนที่ 6) — ต่างจาก catalog.ts ที่ใช้ฝั่งลูกค้า (โชว์แค่ is_active=true)
// เรียกได้เฉพาะจากบัญชี role='admin' เท่านั้น (พึ่ง policy products_admin_all /
// categories_admin_all ที่เปิดไว้ตั้งแต่ขั้นตอนที่ 3) ใช้ได้เฉพาะใน Server Component

function rethrowIfNextInternal(err: unknown): void {
  if (err && typeof err === "object" && "digest" in err) {
    const digest = String((err as { digest?: unknown }).digest ?? "");
    if (digest.startsWith("DYNAMIC_SERVER_USAGE") || digest.startsWith("NEXT_")) {
      throw err;
    }
  }
}

export type AdminProduct = {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  isActive: boolean;
  imageUrl: string | null;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
};

type ProductRow = {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  categories: { name: string } | { name: string }[] | null;
  product_images: { image_url: string; sort_order: number }[] | null;
};

function firstOf<T>(rel: T | T[] | null): T | null {
  if (Array.isArray(rel)) return rel[0] ?? null;
  return rel;
}

function mapProduct(row: ProductRow): AdminProduct {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: firstOf(row.categories)?.name ?? null,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: Number(row.price),
    stockQuantity: row.stock_quantity,
    sku: row.sku,
    isActive: row.is_active,
    imageUrl: images[0]?.image_url ?? null,
  };
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, price, stock_quantity, sku, is_active, categories(name), product_images(image_url, sort_order)",
      )
      .order("id", { ascending: false });

    if (error) {
      console.error("getAdminProducts error:", error.message);
      return [];
    }
    return (data as ProductRow[]).map(mapProduct);
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getAdminProducts failed:", err);
    return [];
  }
}

export type ProductsSummary = { totalCount: number; outOfStockCount: number };

// สรุปตัวเลขสินค้าแบบเบา ๆ (ใช้ count query ไม่ดึงข้อมูลเต็มแถว) สำหรับการ์ดสรุปที่หน้า Dashboard
export async function getProductsSummary(): Promise<ProductsSummary> {
  try {
    const supabase = await createClient();
    const [totalRes, outOfStockRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("stock_quantity", 0),
    ]);

    if (totalRes.error || outOfStockRes.error) {
      console.error("getProductsSummary error:", (totalRes.error ?? outOfStockRes.error)?.message);
      return { totalCount: 0, outOfStockCount: 0 };
    }

    return { totalCount: totalRes.count ?? 0, outOfStockCount: outOfStockRes.count ?? 0 };
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getProductsSummary failed:", err);
    return { totalCount: 0, outOfStockCount: 0 };
  }
}

export type LowStockProduct = {
  id: number;
  name: string;
  sku: string;
  stockQuantity: number;
  imageUrl: string | null;
};

type LowStockRow = {
  id: number;
  name: string;
  sku: string;
  stock_quantity: number;
  product_images: { image_url: string; sort_order: number }[] | null;
};

const LOW_STOCK_THRESHOLD = 5;

// รายการสินค้าใกล้หมดสต็อก (stock_quantity <= LOW_STOCK_THRESHOLD) เรียงจากน้อยไปมาก
// ใช้แสดงเป็นการ์ดแจ้งเตือนที่หน้า Dashboard แทนปุ่มทางลัด — เฉพาะสินค้าที่เปิดขายอยู่ (is_active)
export async function getLowStockProducts(limit = 5): Promise<LowStockProduct[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, name, sku, stock_quantity, product_images(image_url, sort_order)")
      .eq("is_active", true)
      .lte("stock_quantity", LOW_STOCK_THRESHOLD)
      .order("stock_quantity", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("getLowStockProducts error:", error.message);
      return [];
    }

    return (data as LowStockRow[]).map((row) => {
      const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
      return {
        id: row.id,
        name: row.name,
        sku: row.sku,
        stockQuantity: row.stock_quantity,
        imageUrl: images[0]?.image_url ?? null,
      };
    });
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getLowStockProducts failed:", err);
    return [];
  }
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id, name, slug").order("name");

    if (error) {
      console.error("getAdminCategories error:", error.message);
      return [];
    }
    return data;
  } catch (err) {
    rethrowIfNextInternal(err);
    console.error("getAdminCategories failed:", err);
    return [];
  }
}
