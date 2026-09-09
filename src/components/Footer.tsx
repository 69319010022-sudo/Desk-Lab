import Link from "next/link";
import Container from "./Container";

type FooterItem = { label: string; href?: string };
type FooterColumn = { title: string; items: FooterItem[] };

const columns: FooterColumn[] = [
  {
    title: "DeskLab",
    items: [{ label: "แหล่งรวมอุปกรณ์จัดโต๊ะคอมพิวเตอร์ เพื่อประสิทธิภาพการทำงานและความสร้างสรรค์ในทุกวัน" }],
  },
  {
    title: "ช่วยเหลือ",
    items: [
      { label: "คำถามที่พบบ่อย", href: "/help" },
      { label: "การจัดส่งสินค้า", href: "/help/shipping" },
      { label: "นโยบายการรับประกัน", href: "/help/warranty" },
      { label: "เกี่ยวกับเรา", href: "/about" },
    ],
  },

  {
    title: "ติดต่อเรา",
    items: [
      { label: "อีเมล: support@desklab.com" },
      { label: "โทร: 02-123-4567" },
      { label: "เวลาทำการ: จันทร์ - ศุกร์ 09:00 - 18:00 น." },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-footer text-white/70">
      <Container className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 md:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-sm font-bold text-white">{col.title}</p>
            <ul className="space-y-2 text-sm leading-relaxed">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link href={item.href} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10 py-4">
        <Container className="flex flex-col gap-2 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <span>© 2026 DeskLab. All rights reserved.</span>
          <span>นโยบายความเป็นส่วนตัว · ข้อตกลงการใช้งาน</span>
        </Container>
      </div>
    </footer>
  );
}
