'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    phone?: string;
    avatar_url?: string;
  };
}

interface ProfileContentProps {
  user: User;
}

export function ProfileContent({ user }: ProfileContentProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [username, setUsername] = useState(user.user_metadata?.username || '');
  const [phone, setPhone] = useState(user.user_metadata?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const handleAvatarUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.match(/image\/(jpg|jpeg|png)/)) {
      setError('กรุณาเลือกไฟล์ JPG หรือ PNG');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 2MB');
      return;
    }

    // For now, just store the file name
    // TODO: Implement actual file upload to storage
    setAvatarUrl(file.name);
    setError('');
  }, []);

  const handleSaveProfile = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // TODO: Call server action to update user profile
      // const result = await updateProfileAction({
      //   username: username.trim(),
      //   phone: phone.trim(),
      // });
      // if (result.success) {
      //   setSuccess('บันทึกการเปลี่ยนแปลงเรียบร้อย');
      // } else {
      //   setError(result.error || 'ไม่สามารถบันทึกได้');
      // }

      // Temporary: show success
      setSuccess('บันทึกการเปลี่ยนแปลงเรียบร้อย');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  }, [username, phone]);

  const handleLogout = useCallback(async () => {
    try {
      // TODO: Call logout server action
      // await signOutAction();
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถออกจากระบบได้');
    }
  }, [router]);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Left Rail - Navigation */}
      <nav className="w-[76px] bg-[var(--bg-inverse)] text-white flex flex-col items-center py-6 gap-8">
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 rounded-[11px] bg-white">
          <span className="text-[13px] font-medium text-[var(--bg-inverse)]">DL</span>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-1">
          <Link
            href="/shop"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="หน้าแรก"
          >
            <div className="text-[18px] opacity-50">🏠</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">หน้าแรก</span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="สินค้า"
          >
            <div className="text-[18px] opacity-50">🛍️</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">สินค้า</span>
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="ตะกร้า"
          >
            <div className="text-[18px] opacity-50">🛒</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">ตะกร้า</span>
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="คำสั่งซื้อ"
          >
            <div className="text-[18px] opacity-50">📋</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">คำสั่งซื้อ</span>
          </Link>
        </div>

        {/* Account - Bottom (active) */}
        <div className="mt-auto">
          <div className="flex items-center justify-center w-[60px] h-[58px] rounded-lg bg-white/10 flex-col gap-1">
            <div className="text-[18px]">👤</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white">บัญชี</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-[68px] bg-white border-b border-[var(--border-subtle)] flex items-center justify-between px-7 gap-5">
          <div>
            <h1 className="text-[20px] font-medium text-[var(--text-ink)]">โปรไฟล์</h1>
            <p className="text-[12px] text-[var(--text-faint)] mt-0.5">DeskLab · จัดการบัญชีของคุณ</p>
          </div>
          <input
            type="text"
            placeholder="ค้นหาสินค้า ชื่อ หรือรหัส SKU"
            className="flex-1 max-w-md h-[42px] px-[14px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition"
          />
          <div className="h-[42px] bg-[var(--bg-inverse)] text-white px-4 rounded-[10px] flex items-center gap-3 shrink-0 w-[180px]">
            <span className="text-[13px] font-medium">ตะกร้า 0</span>
            <div className="w-px h-[18px] bg-white/25" />
            <span className="text-[13px] font-medium font-mono">฿0</span>
          </div>
          <div className="w-[38px] h-[38px] rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
            <span className="text-[12px] text-[var(--text-muted)]">{getInitials(user.email)}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 gap-6 flex">
          {/* Sidebar Menu */}
          <div className="w-[280px] shrink-0">
            {/* User Info Card */}
            <div className="mb-6">
              <div className="w-[72px] h-[72px] rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center mx-auto mb-4">
                <span className="text-[16px] font-medium text-white bg-[var(--bg-inverse)] w-full h-full rounded-full flex items-center justify-center">
                  {getInitials(user.email)}
                </span>
              </div>
              <h3 className="text-[16px] font-medium text-[var(--text-ink)] text-center mb-1">
                {username || user.email}
              </h3>
              <p className="text-[12px] text-[var(--text-muted)] text-center">{user.email}</p>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4 mb-4" />

            {/* Menu Items */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full h-[44px] px-5 rounded-lg text-left text-[14px] font-medium transition ${
                  activeTab === 'profile'
                    ? 'bg-[var(--action-selected-tint)] text-[var(--text-ink)]'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                โปรไฟล์
              </button>
              <Link
                href="/profile/addresses"
                className="block w-full h-[44px] px-5 rounded-lg text-left text-[14px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition"
              >
                ที่อยู่จัดส่ง
              </Link>
              <Link
                href="/orders"
                className="block w-full h-[44px] px-5 rounded-lg text-left text-[14px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg-surface)] transition"
              >
                ประวัติการสั่งซื้อ
              </Link>
            </div>

            <div className="border-t border-[var(--border-subtle)] mt-4 pt-4" />

            <button
              onClick={handleLogout}
              className="w-full h-[24px] px-5 text-left text-[14px] font-medium text-[var(--status-cancelled)] hover:opacity-80 transition"
            >
              ออกจากระบบ
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-[13px] text-green-700">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[13px] text-red-700">{error}</p>
              </div>
            )}

            {/* Avatar Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-6 mb-6">
              <div className="flex items-center gap-6">
                <div className="w-[64px] h-[64px] rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
                  <span className="text-[16px] font-medium text-white bg-[var(--bg-inverse)] w-full h-full rounded-full flex items-center justify-center">
                    {getInitials(user.email)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[16px] font-medium text-[var(--text-ink)] mb-1">รูปโปรไฟล์</h4>
                  <p className="text-[12px] text-[var(--text-muted)] mb-4">รองรับ JPG, PNG ขนาดไม่เกิน 2MB</p>
                  <button
                    type="button"
                    onClick={handleAvatarUploadClick}
                    disabled={isLoading}
                    className="px-6 h-[40px] bg-white border border-[var(--border-default)] rounded-[10px] text-[14px] font-medium text-[var(--text-ink)] hover:bg-[var(--bg-surface)] disabled:opacity-50 transition"
                  >
                    เปลี่ยนรูป
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-7">
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Username Field */}
                <div className="flex gap-6">
                  <div className="flex-1">
                    <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">
                      ชื่อผู้ใช้
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Poonyapat2550"
                      disabled={isLoading}
                      className="w-full h-[44px] px-[14px] bg-white border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
                    />
                    <p className="text-[12px] text-[var(--text-faint)] mt-2">
                      a-z, A-Z, 0-9, _ , . ความยาว 3–30 ตัวอักษร · ห้ามซ้ำ
                    </p>
                  </div>

                  {/* Phone Field */}
                  <div className="flex-1">
                    <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="081-234-5678"
                      disabled={isLoading}
                      className="w-full h-[44px] px-[14px] bg-white border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex-1">
                  <label className="block text-[13px] font-medium text-[var(--text-muted)] mb-1.5">
                    อีเมล
                  </label>
                  <div className="h-[44px] px-[14px] bg-white border border-[var(--border-default)] rounded-[10px] text-[14px] text-[var(--text-ink)] flex items-center">
                    {user.email}
                  </div>
                  <p className="text-[12px] text-[var(--text-faint)] mt-2">
                    เปลี่ยนอีเมลได้จากการติดต่อฝ่ายสนับสนุน
                  </p>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-[220px] h-[44px] bg-[var(--text-ink)] text-white rounded-[10px] font-medium text-[14px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isLoading ? '⏳ กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
