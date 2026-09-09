import { redirect } from 'next/navigation';
import { CheckoutContent } from './checkout-content';
import { getCurrentUser } from '@/lib/data/auth';
import { getCart } from '@/lib/data/cart';

/**
 * Checkout Page - Server Component
 *
 * This page displays the checkout flow with:
 * - Shipping address selection
 * - Payment method selection
 * - Order summary with totals
 * - Confirm order button
 */
export const metadata = {
  title: 'ชำระเงิน - DeskLab',
  description: 'ยืนยันที่อยู่, วิธีชำระเงิน และสรุปคำสั่งซื้อ',
};

// Mock user addresses - in production, fetch from database
const mockUserAddresses = [
  {
    id: 'addr-1',
    type: 'home' as const,
    name: 'บ้าน',
    address: '123 ถนนสุขุมวิท, ห้องชุด 4B, เขตวัฒนา',
    city: 'กรุงเทพฯ',
    postalCode: '10110',
    phone: '081-234-5678',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'work' as const,
    name: 'ที่ทำงาน',
    address: '456 อาคารสำนักงาน พระราม 5, ชั้น 20, เขตพญาไท',
    city: 'กรุงเทพฯ',
    postalCode: '10400',
    phone: '082-345-6789',
    isDefault: false,
  },
];

export default async function CheckoutPage() {
  // Get current user (redirect to login if not authenticated)
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch cart data
  const cart = await getCart();

  // Redirect to cart if no items
  if (!cart.items || cart.items.length === 0) {
    redirect('/cart');
  }

  // Calculate totals
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCost = 50;
  const grandTotal = cartTotal + shippingCost;

  return (
    <CheckoutContent
      cartItems={cart.items}
      cartCount={cartCount}
      cartTotal={cartTotal}
      shippingCost={shippingCost}
      grandTotal={grandTotal}
      addresses={mockUserAddresses}
      userEmail={user.email}
    />
  );
}
