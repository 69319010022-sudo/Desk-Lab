import { redirect } from "next/navigation";
import { getAdminProducts, getAdminCategories } from "@/lib/data/admin-catalog";
import { getCurrentUser } from "@/lib/data/auth";
import ProductsManager from "@/components/admin/ProductsManager";

// หน้าจัดการสินค้า — ขั้นตอนที่ 6: CRUD สินค้า + หมวดหมู่ต่อ Supabase จริงแล้ว
// รายละเอียดการเช็ค FK/นิยาม ดูที่ src/lib/actions/admin-catalog.ts และ desklab-plan.md
export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  if (user?.role === "cashier") {
    redirect("/admin/orders");
  }

  const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);

  return <ProductsManager products={products} categories={categories} />;
}
