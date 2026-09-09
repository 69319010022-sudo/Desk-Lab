'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Call server action to authenticate user
      // const result = await signInAction({
      //   email: email.trim(),
      //   password: password,
      // });
      // if (result.success) {
      //   router.push('/shop');
      // } else {
      //   setError(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
      // }

      // Temporary: redirect to shop
      router.push('/shop');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, router]);

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

        {/* Account - Bottom */}
        <div className="mt-auto">
          <Link
            href="/profile"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg bg-[var(--border-default)] hover:bg-[var(--border-subtle)] transition flex-col gap-1"
            title="บัญชี"
          >
            <div className="text-[18px]">👤</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">บัญชี</span>
          </Link>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          {/* Brand Section */}
          <div className="text-center">
            <h1 className="text-[32px] font-semibold text-[var(--text-ink)] tracking-[-0.4px]">
              DeskLab
            </h1>
            <p className="text-[14px] text-[var(--text-muted)] mt-2">
              ระบบร้านค้าออนไลน์สำหรับของแต่งโต๊ะทำงาน
            </p>
          </div>

          {/* Login Card */}
          <div className="w-[400px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[14px] p-10">
            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-[24px] font-semibold text-[var(--text-ink)] tracking-[-0.2px]">
                เข้าสู่ระบบ
              </h2>
              <p className="text-[14px] text-[var(--text-muted)] mt-2">
                ยินดีต้อนรับกลับมาที่ DeskLab
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[13px] text-red-700">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-[var(--text-muted)]">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full h-[44px] px-[14px] bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-[var(--text-muted)]">
                    รหัสผ่าน
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-ink)] transition disabled:opacity-50"
                  >
                    {showPassword ? 'ซ่อน' : 'แสดง'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full h-[44px] px-[14px] bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
                  required
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-[13px] font-medium text-[var(--text-muted)] hover:text-[var(--text-ink)] transition"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full h-[44px] bg-[var(--text-ink)] text-white rounded-[10px] font-medium text-[14px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? '⏳ กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-[14px] text-[var(--text-muted)]">
                ยังไม่มีบัญชี?{' '}
                <Link
                  href="/register"
                  className="font-medium text-[var(--text-ink)] hover:underline transition"
                >
                  สมัครสมาชิก
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
