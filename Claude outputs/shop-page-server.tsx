import { redirect } from 'next/navigation';
import { ShopPageContent } from './shop-content';
import { getCurrentUser } from '@/lib/data/auth';
import { getCategories, getProducts } from '@/lib/data/catalog';
import { getCart } from '@/lib/data/cart';

/**
 * Shop Page - Server Component
 *
 * This page displays a product catalog with:
 * - Category filtering
 * - Product search
 * - Add to cart functionality
 * - Current cart summary (right sidebar)
 */
export const metadata = {
  title: 'เลือกสินค้า - DeskLab',
  description: 'ร้านขายของแต่งโต๊ะคอมออนไลน์ DeskLab',
};

export default async function ShopPage() {
  // Get current user (redirect to login if not authenticated)
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch data in parallel
  const [categories, products, cart] = await Promise.all([
    getCategories(),
    getProducts(),
    getCart(),
  ]);

  // Calculate cart totals
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <ShopPageContent
      categories={categories}
      products={products}
      cartCount={cartCount}
      cartTotal={cartTotal}
      currentCartItems={cart.items}
    />
  );
}
