'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function RegisterContent() {
  const router = useRouter();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate username format
  const validateUsername = useCallback((value: string) => {
    if (!value) return 'ชื่อผู้ใช้ต้องไม่ว่าง';
    if (value.length < 3 || value.length > 30) {
      return 'ชื่อผู้ใช้ต้อง 3-30 ตัวอักษร';
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
      return 'ชื่อผู้ใช้มีตัวอักษรไม่ถูกต้อง (a-z, A-Z, 0-9, _, . เท่านั้น)';
    }
    return '';
  }, []);

  // Validate email format
  const validateEmail = useCallback((value: string) => {
    if (!value) return 'อีเมลต้องไม่ว่าง';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'อีเมลไม่ถูกต้อง';
    }
    return '';
  }, []);

  // Validate password
  const validatePassword = useCallback((value: string) => {
    if (!value) return 'รหัสผ่านต้องไม่ว่าง';
    if (value.length < 8) {
      return 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
    }
    return '';
  }, []);

  // Validate confirm password
  const validateConfirmPassword = useCallback((value: string) => {
    if (!value) return 'ยืนยันรหัสผ่านต้องไม่ว่าง';
    if (value !== password) {
      return 'รหัสผ่านไม่ตรงกัน';
    }
    return '';
  }, [password]);

  const handleRegister = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');

      // Validate all fields
      const usernameError = validateUsername(username);
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);
      const confirmPasswordError = validateConfirmPassword(confirmPassword);

      if (usernameError || emailError || passwordError || confirmPasswordError) {
        setError(
          usernameError || emailError || passwordError || confirmPasswordError
        );
        return;
      }

      if (!termsAccepted) {
        setError('ยอมรับข้อกำหนดและเงื่อนไขการใช้งาน');
        return;
      }

      setIsLoading(true);

      try {
        // TODO: Call server action to register user
        // const result = await registerAction({
        //   username: username.trim(),
        //   email: email.trim(),
        //   password: password,
        // });
        // if (result.success) {
        //   setSuccess('สมัครสมาชิกเรียบร้อย');
        //   setTimeout(() => {
        //     router.push('/login');
        //   }, 2000);
        // } else {
        //   setError(result.error || 'ไม่สามารถสมัครสมาชิกได้');
        // }

        // Temporary: show success
        setSuccess('สมัครสมาชิกเรียบร้อย');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
      } finally {
        setIsLoading(false);
      }
    },
    [
      username,
      email,
      password,
      confirmPassword,
      termsAccepted,
      validateUsername,
      validateEmail,
      validatePassword,
      validateConfirmPassword,
      router,
    ]
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Left Rail */}
      <nav className="w-[76px] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col items-center py-6 gap-8">
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 rounded-[11px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
          <span className="text-[13px] font-medium text-[var(--text-ink)]">DL</span>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-1">
          <Link
            href="/shop"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-white transition flex-col gap-1"
            title="หน้าแรก"
          >
            <div className="text-[18px] opacity-50">🏠</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
              หน้าแรก
            </span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-white transition flex-col gap-1"
            title="สินค้า"
          >
            <div className="text-[18px] opacity-50">🛍️</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
              สินค้า
            </span>
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-white transition flex-col gap-1"
            title="ตะกร้า"
          >
            <div className="text-[18px] opacity-50">🛒</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
              ตะกร้า
            </span>
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-white transition flex-col gap-1"
            title="คำสั่งซื้อ"
          >
            <div className="text-[18px] opacity-50">📋</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)]">
              คำสั่งซื้อ
            </span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Page Title */}
        <div className="mb-8 text-center max-w-[1364px]">
          <h1 className="text-[32px] font-semibold text-[var(--text-ink)] tracking-[-0.4px] mb-2">
            DeskLab
          </h1>
          <p className="text-[14px] text-[var(--text-muted)]">
            สร้างบัญชีใหม่เพื่อเริ่มช้อปกับ DeskLab
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white border border-[var(--border-subtle)] rounded-[14px] p-10 w-full max-w-[400px] shadow-sm">
          {/* Card Header */}
          <div className="mb-6">
            <h2 className="text-[24px] font-semibold text-[var(--text-ink)] tracking-[-0.2px] mb-2">
              สมัครสมาชิก
            </h2>
            <p className="text-[14px] text-[var(--text-muted)]">
              ใช้เวลาไม่ถึงนาที เริ่มช้อปได้ทันที
            </p>
          </div>

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

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-6">
            {/* Username Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--text-muted)]">
                ชื่อผู้ใช้
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น top123"
                disabled={isLoading}
                className="w-full h-[44px] px-[14px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
              />
              <p className="text-[12px] text-[var(--text-faint)]">
                a-z, A-Z, 0-9, _ , . ความยาว 3–30 ตัวอักษร · ห้ามซ้ำ
              </p>
            </div>

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
                className="w-full h-[44px] px-[14px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--text-muted)]">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full h-[44px] px-[14px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text-ink)] disabled:opacity-50 transition"
                >
                  {showPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-[var(--text-muted)]">
                ยืนยันรหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full h-[44px] px-[14px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text-ink)] disabled:opacity-50 transition"
                >
                  {showConfirmPassword ? 'ซ่อน' : 'แสดง'}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={isLoading}
                className="w-[18px] h-[18px] rounded-[5px] border border-[var(--border-default)] mt-0.5 cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="terms"
                className="text-[14px] text-[var(--text-muted)] cursor-pointer flex-1"
              >
                ยอมรับข้อกำหนดและเงื่อนไขการใช้งาน
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[44px] bg-white border border-[var(--border-default)] text-[var(--text-ink)] rounded-[10px] font-medium text-[14px] hover:bg-[var(--bg-surface)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? '⏳ กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-[14px] text-[var(--text-muted)]">
              มีบัญชีอยู่แล้ว?{' '}
              <Link
                href="/login"
                className="text-[var(--text-ink)] font-medium hover:underline transition"
              >
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
