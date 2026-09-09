"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/lib/actions/auth";

const items = [
  { href: "/account/profile", label: "โปรไฟล์ของฉัน" },
  { href: "/account/addresses", label: "ที่อยู่จัดส่ง" },
  { href: "/account/orders", label: "ประวัติคำสั่งซื้อ" },
];

// ปรับสไตล์ตาม Figma (POS) — คงลิงก์เมนู + ฟอร์ม signOutAction เดิมไว้ทั้งหมด
// เปลี่ยนแค่โทเคนสี/ขอบมนให้เข้าธีมเดียวกับ Login/Register/Cart
export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 rounded-[14px] border border-subtle bg-background p-3 md:w-60">
      <nav className="flex flex-col gap-1 text-sm">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[10px] px-3 py-2.5 text-[14px] font-medium transition-colors ${
                active ? "bg-sunken text-ink" : "text-muted hover:bg-sunken"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <div className="my-1 border-t border-subtle" />
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-[10px] px-3 py-2.5 text-left text-[14px] font-medium text-[color:var(--color-status-cancelled)] transition-colors hover:bg-sunken"
          >
            ออกจากระบบ
          </button>
        </form>
      </nav>
    </aside>
  );
}
