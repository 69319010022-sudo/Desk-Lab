import { redirect } from 'next/navigation';
import { RegisterContent } from './register-content';
import { getCurrentUser } from '@/lib/data/auth';

/**
 * Register Page - Server Component
 *
 * This page handles user registration with:
 * - Username input with format validation (3-30 chars, a-z, A-Z, 0-9, _, .)
 * - Email input with validation
 * - Password input with show/hide toggle
 * - Confirm password input
 * - Terms and conditions checkbox
 * - Register button
 * - Link to login page for existing users
 */
export const metadata = {
  title: 'สมัครสมาชิก - DeskLab',
  description: 'สร้างบัญชี DeskLab ใหม่และเริ่มช้อปปิ้ง',
};

export default async function RegisterPage() {
  // Redirect to shop if already authenticated
  const user = await getCurrentUser();
  if (user) {
    redirect('/shop');
  }

  return <RegisterContent />;
}
