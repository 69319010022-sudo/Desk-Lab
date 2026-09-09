import { redirect } from 'next/navigation';
import { CartContent } from './cart-content';
import { getCurrentUser } from '@/lib/data/auth';
import { getCart } from '@/lib/data/cart';

/**
 * Cart Page - Server Component
 *
 * This page displays the user's shopping cart with:
 * - Cart items with product details
 * - Quantity adjusters
 * - Delete item functionality
 * - Order summary with totals
 * - Checkout button
 */
export const metadata = {
  title: 'ตะกร้าสินค้า - DeskLab',
  description: 'ตรวจสอบและชำระเงินสำหรับสินค้าในตะกร้า DeskLab',
};

export default async function CartPage() {
  // Get current user (redirect to login if not authenticated)
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch cart data
  const cart = await getCart();

  // Calculate totals
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = 50;
  const grandTotal = cartTotal + shippingCost;

  return (
    <CartContent
      cartItems={cart.items}
      cartCount={cartCount}
      cartTotal={cartTotal}
      shippingCost={shippingCost}
      grandTotal={grandTotal}
    />
  );
}
