import Rail from "@/components/Rail";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/data/auth";
import { getCart } from "@/lib/data/cart";

// ดึงสถานะล็อกอิน + ตะกร้าจริงจาก Supabase ทุกครั้งที่มี request (Server Component)
// โครง POS: Rail ซ้าย 76px (นำทาง) ติดทุกหน้า + คอลัมน์ขวา (TopBar 68px + เนื้อหา + Footer)
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, cart] = await Promise.all([getCurrentUser(), getCart()]);
  const cartTotal = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0,
  );

  return (
    <div className="flex min-h-screen">
      <Rail cartCount={cart.itemCount} user={user} />
      <div className="flex min-w-0 flex-1 flex-col bg-sunken">
        <TopBar cartCount={cart.itemCount} cartTotal={cartTotal} user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
