"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import type { CurrentUser } from "@/lib/data/auth";

// TopBar ของโซนแอดมิน — สไตล์เดียวกับ TopBar.tsx ฝั่งลูกค้า (สูง 68px, ชื่อหน้าซ้าย,
// เมนู avatar ขวา) แต่ไม่มีตะกร้า/ช่องค้นหาแบบลูกค้า เปลี่ยนเป็นป้าย "โหมดแอดมิน" แทน

const titleRules: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p.startsWith("/admin/dashboard"), title: "แดชบอร์ด" },
  { match: (p) => p.startsWith("/admin/products"), title: "จัดการสินค้า" },
  { match: (p) => p.startsWith("/admin/orders"), title: "จัดการคำสั่งซื้อ" },
  { match: (p) => p.startsWith("/admin/analytics"), title: "รายงานและวิเคราะห์ข้อมูล" },
  { match: (p) => p.startsWith("/admin/account"), title: "บัญชีแอดมิน" },
];

function pageTitle(pathname: string) {
  return titleRules.find((rule) => rule.match(pathname))?.title ?? "Admin";
}

function initialsOf(text: string) {
  const parts = text.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

export default function AdminTopBar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const title = pageTitle(pathname);
  const initials = initialsOf(user.name || user.email);

  return (
    <header className="flex h-[68px] items-center justify-between border-b border-border bg-background px-[28px]">
      <div className="flex flex-col justify-center">
        <h1 className="text-[18px] font-semibold leading-tight text-ink">{title}</h1>
      </div>

      <div className="flex items-center gap-[14px]">
        <span className="rounded-full bg-[color:var(--color-status-processing-bg)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-status-processing)]">
          {user.role === "cashier" ? "โหมดแคชเชียร์" : "โหมดแอดมิน"}
        </span>

        <div className="group relative">
          <button
            type="button"
            className="flex size-[38px] items-center justify-center overflow-hidden rounded-full bg-primary text-[13px] font-semibold text-white"
          >
            {initials}
          </button>
          <div className="invisible absolute right-0 top-full z-50 w-48 pt-2 group-hover:visible">
            <div className="overflow-hidden rounded-lg border border-border bg-background shadow-lg">
              <div className="border-b border-border px-4 py-2.5">
                <p className="truncate text-sm font-medium text-ink">{user.name ?? "Admin"}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
              <Link
                href="/admin/account"
                className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
              >
                บัญชีแอดมิน
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 text-left text-sm text-[color:var(--color-status-cancelled)] transition-colors hover:bg-surface"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
