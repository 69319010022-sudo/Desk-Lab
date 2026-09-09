import { redirect } from 'next/navigation';
import { OrderHistoryContent } from './order-history-content';
import { getCurrentUser } from '@/lib/data/auth';

/**
 * Order History Page - Server Component
 *
 * This page displays the user's order history with:
 * - List of all orders with status, date, items, and total
 * - Filter chips by order status (All, Pending Payment, Pending Shipment, Paid, Cancelled)
 * - Status badges with color coding
 * - Order actions (Cancel, Reorder)
 * - Account summary sidebar (total orders, total spent, cancelled count)
 */
export const metadata = {
  title: 'ประวัติการสั่งซื้อ - DeskLab',
  description: 'ตรวจสอบสถานะคำสั่งซื้อและประวัติการสั่งซื้อของคุณ',
};

export default async function OrderHistoryPage() {
  // Get current user (redirect to login if not authenticated)
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <OrderHistoryContent user={user} />;
}
