import { redirect } from 'next/navigation';
import { LoginContent } from './login-content';
import { getCurrentUser } from '@/lib/data/auth';

/**
 * Login Page - Server Component
 *
 * This page displays the login form with:
 * - Email input field
 * - Password input field with show/hide toggle
 * - Forgot password link
 * - Sign up link
 * - Login button with error handling
 */
export const metadata = {
  title: 'เข้าสู่ระบบ - DeskLab',
  description: 'เข้าสู่ระบบบัญชี DeskLab เพื่อดำเนินการซื้อสินค้า',
};

export default async function LoginPage() {
  // Get current user (redirect to shop if already authenticated)
  const user = await getCurrentUser();
  if (user) {
    redirect('/shop');
  }

  return <LoginContent />;
}
