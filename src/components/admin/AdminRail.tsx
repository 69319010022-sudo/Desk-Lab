"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Rail ซ้ายของโซนแอดมิน (/admin/*) — สไตล์เดียวกับ Rail.tsx ฝั่งลูกค้า (กล่อง 60x58
// ไอคอน+ป้ายชื่อ, พื้นหลัง bg-ink) แต่เมนูเป็นชุดของแอดมินคนละชุดกับลูกค้าโดยสิ้นเชิง
// ป้ายชื่อในนี้ตั้งใจให้สั้น ส่วนชื่อเต็มไปโชว์ที่ AdminTopBar แทน (แพทเทิร์นเดียวกับ Rail เดิม)

const navItems = [
  { href: "/admin/dashboard", label: "แดชบอร์ด", icon: DashboardIcon },
  { href: "/admin/products", label: "สินค้า", icon: ProductsIcon },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: OrdersIcon },
  { href: "/admin/analytics", label: "รายงาน", icon: AnalyticsIcon },
  { href: "/admin/account", label: "บัญชี", icon: AccountIcon },
];

export default function AdminRail() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-40 flex h-screen w-[76px] shrink-0 flex-col items-center gap-2 bg-ink py-5 text-white">
      <Link
        href="/admin/dashboard"
        className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[11px] bg-white p-[7px]"
        aria-label="DeskLab Admin"
      >
        <img src="/logo-icon.png" alt="DeskLab" className="h-full w-full object-contain" />
      </Link>

      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
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
              className={`text-center text-[9px] font-medium uppercase leading-tight tracking-[0.2px] ${
                active ? "text-white/95" : "text-white/50"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </aside>
  );
}

function iconColorClass(active: boolean) {
  return active ? "text-white" : "text-white/55";
}

// แดชบอร์ด — เกจ/มิเตอร์สรุปภาพรวม
function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={iconColorClass(active)}>
      <path
        d="M2 14a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M9 14 12.2 8.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="14" r="1.2" fill="currentColor" />
    </svg>
  );
}

// จัดการสินค้า — กล่องพัสดุ
function ProductsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={iconColorClass(active)}>
      <path
        d="M2 5.5 9 2l7 3.5v7L9 16l-7-3.5v-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M2 5.5 9 9l7-3.5M9 9v7" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// จัดการคำสั่งซื้อ — ใบเสร็จ (เหมือน OrdersIcon ฝั่งลูกค้า เพื่อความสอดคล้องของ UI)
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

// รายงานและวิเคราะห์ข้อมูล — กราฟแท่ง
function AnalyticsIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={iconColorClass(active)}>
      <rect x="2" y="9" width="3.5" height="7" rx="1" fill="currentColor" />
      <rect x="7.25" y="4" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="12.5" y="1" width="3.5" height="15" rx="1" fill="currentColor" />
    </svg>
  );
}

// บัญชี — คนแบบเรียบ (เหมือน UserIcon ฝั่งลูกค้า)
function AccountIcon({ active }: { active: boolean }) {
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
