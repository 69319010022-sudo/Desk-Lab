import { createClient } from "@/lib/supabase/server";

// อ่านตะกร้าจริงของผู้ใช้ที่ล็อกอินอยู่ ใช้ได้เฉพาะฝั่งเซิร์ฟเวอร์เท่านั้น
// แต่ละคนมี 1 แถวใน carts (สร้างแบบ lazy — สร้างครั้งแรกตอนกด "เพิ่มลงตะกร้า" เท่านั้น
// ดู getOrCreateCartId ใน lib/actions/cart.ts) ไม่ได้สร้างตอนสมัครสมาชิกเหมือน public.users

export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
};

export type CartLineItem = {
  cartItemId: number;
  quantity: number;
  product: CartProduct;
};

export type CartData = {
  cartId: number | null;
  items: CartLineItem[];
  itemCount: number;
};

type ProductJoinRow = {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  product_images?: { image_url: string; sort_order: number }[];
};

function mapCartProduct(row: ProductJoinRow): CartProduct {
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    stockQuantity: row.stock_quantity,
    imageUrl: images[0]?.image_url ?? null,
  };
}

export async function getCart(): Promise<CartData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { cartId: null, items: [], itemCount: 0 };

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) return { cartId: null, items: [], itemCount: 0 };

  const { data: rows, error } = await supabase
    .from("cart_items")
    .select(
      "id, quantity, products(id, name, slug, price, stock_quantity, product_images(image_url, sort_order))",
    )
    .eq("cart_id", cart.id)
    .order("id");

  if (error || !rows) return { cartId: cart.id, items: [], itemCount: 0 };

  const items: CartLineItem[] = rows
    // สินค้าอาจถูกลบไปแล้วในบางเคส (product_id ชี้ไปแถวที่ไม่มีอยู่) — กันไว้ไม่ให้พัง
    .filter((row): row is typeof row & { products: ProductJoinRow } => row.products != null)
    .map((row) => ({
      cartItemId: row.id,
      quantity: row.quantity,
      product: mapCartProduct(row.products),
    }));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { cartId: cart.id, items, itemCount };
}

// เวอร์ชันเบาสำหรับ Navbar (ไม่ต้อง join ข้อมูลสินค้าเต็มๆ ทุกหน้า)
export async function getCartItemCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) return 0;

  const { data: rows } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cart.id);

  return (rows ?? []).reduce((sum, row) => sum + row.quantity, 0);
}
