"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CurrentUser } from "@/lib/data/auth";

// Rail ซ้าย 76px ตามดีไซน์ POS ใน Figma จริง (ดึงด้วย get_design_context บนเฟรม
// "01 · Home — POS", node 1:136 "Chrome/Rail") — ทุกไอเทมเป็นกล่อง 60x58 ไอคอน+ป้ายชื่อ
// ซ้อนกัน ไม่ใช่ไอคอนลอยแบบตอนแรกที่ประมาณเอง — แทน Navbar แนวนอนเดิม

const navItems = [
  { href: "/", label: "หน้าแรก", icon: HomeIcon },
  { href: "/shop", label: "สินค้า", icon: GridIcon },
  { href: "/cart", label: "ตะกร้า", icon: CartIcon },
  { href: "/account/orders", label: "คำสั่งซื้อ", icon: OrdersIcon },
];

export default function Rail({
  user = null,
}: {
  cartCount?: number;
  user?: CurrentUser | null;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-[76px] shrink-0 flex-col items-center justify-between bg-ink py-5 text-white">
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/"
          className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[11px] bg-white text-[13px] font-medium text-ink"
          aria-label="DeskLab"
        >
          DL
        </Link>

        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-[58px] w-[60px] flex-col items-center justify-center gap-[5px] rounded-[10px] transition-colors ${
                active ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <Icon active={active} />
              <span
                className={`text-[10px] font-medium uppercase tracking-[0.2px] ${
                  active ? "text-white/95" : "text-white/50"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <Link
        href={user ? "/account/profile" : "/login"}
        className={`flex h-[58px] w-[60px] flex-col items-center justify-center gap-[5px] rounded-[10px] transition-colors ${
          pathname.startsWith("/account/profile") ? "bg-white/10" : "hover:bg-white/5"
        }`}
      >
        <UserIcon active={pathname.startsWith("/account/profile")} />
        <span
          className={`text-[10px] font-medium uppercase tracking-[0.2px] ${
            pathname.startsWith("/account/profile") ? "text-white/95" : "text-white/50"
          }`}
        >
          บัญชี
        </span>
      </Link>
    </aside>
  );
}

// ไอคอนทั้งหมดดึงรูปทรง/ตำแหน่งมาจาก Figma จริง (node 1:140-1:171) — วาดใหม่ด้วย
// currentColor เพื่อคุม active/inactive (ขาวเต็ม vs ขาว 55%) ได้จากคลาสเดียว

function iconColorClass(active: boolean) {
  return active ? "text-white" : "text-white/55";
}

// หน้าแรก — ทรงจอมอนิเตอร์ตั้งโต๊ะ (กรอบจอ + ขาตั้ง) ให้เข้ากับธีมร้านของแต่งโต๊ะคอม
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={iconColorClass(active)}>
      <rect x="1" y="6" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="6" y="10" width="6" height="7" rx="1" fill="currentColor" />
    </svg>
  );
}

// สินค้า — กริด 2x2
function GridIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={iconColorClass(active)}>
      <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

// ตะกร้า
function CartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconColorClass(active)}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

// คำสั่งซื้อ — ใบเสร็จ (กรอบ + เส้นรายการ 3 บรรทัด)
function OrdersIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={iconColorClass(active)}>
      <rect x="2" y="1" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="5" y="5" width="8" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="5" y="9" width="8" height="1.5" rx="0.75" fill="currentColor" />
      <rect x="5" y="13" width="5" height="1.5" rx="0.75" fill="currentColor" />
    </svg>
  );
}

// บัญชี — คนแบบเรียบ
function UserIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={iconColorClass(active)}
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}
