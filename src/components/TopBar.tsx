"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";
import { formatBaht } from "@/lib/demo-data";
import type { CurrentUser } from "@/lib/data/auth";

// TopBar 68px ดึงมาจาก Figma จริง (get_design_context, node 1:303 "Chrome/TopBar" บนเฟรม
// "01 · Home — POS") — ชื่อหน้า+แท็กไลน์ 2 บรรทัด, ช่องค้นหา (ยังเป็น UI เฉยๆ ไม่ผูกระบบค้นหาจริง),
// ตั๋วตะกร้าโชว์ยอดรวมจริง, วงกลม avatar (เมนูโปรไฟล์/ออกจากระบบ เป็นส่วนที่เพิ่มเองเพราะดีไซน์นิ่ง
// ไม่มี interaction — ย้ายมาจาก Navbar เดิม)

const titleRules: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/", title: "หน้าแรก" },
  { match: (p) => p.startsWith("/shop"), title: "สินค้าทั้งหมด" },
  { match: (p) => p.startsWith("/product"), title: "รายละเอียดสินค้า" },
  { match: (p) => p.startsWith("/cart"), title: "ตะกร้าสินค้า" },
  { match: (p) => p.startsWith("/checkout"), title: "ชำระเงิน" },
  { match: (p) => p.startsWith("/account/profile"), title: "โปรไฟล์ของฉัน" },
  { match: (p) => p.startsWith("/account/addresses"), title: "ที่อยู่จัดส่ง" },
  { match: (p) => p.startsWith("/account/orders"), title: "ประวัติคำสั่งซื้อ" },
  { match: (p) => p.startsWith("/login"), title: "เข้าสู่ระบบ" },
  { match: (p) => p.startsWith("/register"), title: "สมัครสมาชิก" },
];

function pageTitle(pathname: string) {
  return titleRules.find((rule) => rule.match(pathname))?.title ?? "DeskLab";
}

function initialsOf(text: string) {
  const parts = text.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

export default function TopBar({
  cartCount = 0,
  cartTotal = 0,
  user = null,
}: {
  cartCount?: number;
  cartTotal?: number;
  user?: CurrentUser | null;
}) {
  const pathname = usePathname();
  const title = pageTitle(pathname);
  const initials = initialsOf(user?.name || user?.email || "G");

  return (
    <header className="flex h-[68px] items-center justify-between border-b border-border bg-background px-[28px]">
      <div className="flex flex-col justify-center">
        <h1 className="text-[18px] font-semibold leading-tight text-ink">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-[14px]">
        <div className="flex h-9 w-[220px] items-center gap-2 rounded-lg border border-subtle bg-sunken px-3 text-muted">
          <SearchIcon />
          <span className="text-[13px]">ค้นหาสินค้า...</span>
        </div>

        <Link
          href="/cart"
          className="flex h-9 w-[180px] items-center gap-2 rounded-lg bg-ink px-3 text-white"
        >
          <TicketIcon />
          <span className="text-[12px] text-white/60">{cartCount} รายการ</span>
          <span className="ml-auto h-4 w-px bg-white/20" />
          <span className="font-mono text-[13px] font-semibold">
            {formatBaht(cartTotal)}
          </span>
        </Link>

        {user ? (
          <div className="group relative">
            <button
              type="button"
              className="flex size-[38px] items-center justify-center overflow-hidden rounded-full bg-primary text-[13px] font-semibold text-white"
            >
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
            <div className="invisible absolute right-0 top-full z-50 w-44 pt-2 group-hover:visible">
              <div className="overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                <Link
                  href="/account/profile"
                  className="block px-4 py-2.5 text-sm text-ink transition-colors hover:bg-surface"
                >
                  โปรไฟล์ของฉัน
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
        ) : (
          <Link
            href="/login"
            className="flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            เข้าสู่ระบบ
          </Link>
        )}
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
