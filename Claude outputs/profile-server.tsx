import { redirect } from 'next/navigation';
import { ProfileContent } from './profile-content';
import { getCurrentUser } from '@/lib/data/auth';

/**
 * Profile Page - Server Component
 *
 * This page displays the user profile with:
 * - User avatar and basic info
 * - Editable profile fields (username, phone)
 * - Sidebar navigation (Profile, Addresses, Order History, Logout)
 * - Avatar upload button
 * - Save changes button
 */
export const metadata = {
  title: 'โปรไฟล์ - DeskLab',
  description: 'จัดการบัญชีและข้อมูลส่วนตัวของคุณ',
};

export default async function ProfilePage() {
  // Get current user (redirect to login if not authenticated)
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <ProfileContent user={user} />;
}
