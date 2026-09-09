import { redirect } from 'next/navigation';
import { ProductDetailContent } from './product-detail-content';
import { getCurrentUser } from '@/lib/data/auth';
import { getProductBySlug, getRelatedProducts } from '@/lib/data/catalog';
import { getCart } from '@/lib/data/cart';

/**
 * Product Detail Page - Server Component
 *
 * This page displays detailed product information with:
 * - Product image gallery (main + thumbnails)
 * - Product details (name, price, stock, specs)
 * - Quantity selector and add to cart
 * - Product tabs (description, reviews, shipping)
 * - Related products carousel
 * - Current user's cart summary
 */
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return {
    title: `${product?.name || 'สินค้า'} - DeskLab`,
    description: product?.description || 'ร้านขายของแต่งโต๊ะคอมออนไลน์ DeskLab',
  };
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  // Get current user (redirect to login if not authenticated)
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch data in parallel
  const [product, relatedProducts, cart] = await Promise.all([
    getProductBySlug(params.slug),
    getRelatedProducts(params.slug, 4),
    getCart(),
  ]);

  if (!product) {
    redirect('/shop');
  }

  // Calculate cart totals
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <ProductDetailContent
      product={product}
      relatedProducts={relatedProducts}
      cartCount={cartCount}
      cartTotal={cartTotal}
      currentCartItems={cart.items}
    />
  );
}
