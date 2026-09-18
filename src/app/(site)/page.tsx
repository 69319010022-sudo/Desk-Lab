import { getCategories, getProducts } from "@/lib/data/catalog";
import { HeroSection, CategoryRow, FeaturedGrid } from "./HomeAnimatedSections";

// Home ดึงมาจาก Figma จริง (get_design_context, node 1:300 "01 · Home — POS",
// fileKey UqD5VwG7M7IFPZMoFuoSo2) — hero การ์ดมืดทรงกลม + แผง "facts" ด้านขวา,
// แถวหมวดหมู่ 5 อันดับแรก (นับจากสินค้าจริง มากไปน้อย) พร้อมไอคอน flat color-block
// (ตัวอักษรแรกของชื่อหมวด แทน emoji เดิม เพราะยังไม่มีไฟล์ไอคอนจริงจากดีไซน์),
// กริดสินค้าแนะนำ 4 ชิ้นด้วย Tile/Product ใหม่, และแถบความน่าเชื่อถือ 3 คอลัมน์ท้ายหน้า
// ข้อมูลทั้งหมดยังคงดึงจริงจาก Supabase เหมือนเดิม ไม่มีตัวเลขสมมติ
//
// HeroSection/CategoryRow/FeaturedGrid ใช้ motion.xxx จึงต้องอยู่ในไฟล์แยก
// "HomeAnimatedSections.tsx" ที่มี "use client" (ดูเหตุผลในคอมเมนต์ไฟล์นั้น) —
// ไฟล์นี้ยังคงเป็น async Server Component ดึงข้อมูลจาก Supabase เหมือนเดิมทุกประการ

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const featured = products.slice(0, 4);
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const productCountByCategory = new Map<number, number>();
  for (const p of products) {
    productCountByCategory.set(p.categoryId, (productCountByCategory.get(p.categoryId) ?? 0) + 1);
  }
  const topCategories = [...categories]
    .sort((a, b) => (productCountByCategory.get(b.id) ?? 0) - (productCountByCategory.get(a.id) ?? 0))
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-[28px] px-[28px] pb-[32px] pt-[24px]">
      <HeroSection productCount={products.length} />
      <CategoryRow categories={topCategories} />
      <FeaturedGrid products={featured} categoryNameById={categoryNameById} />
      <TrustBar />
    </div>
  );
}

function TrustBar() {
  const items = [
    {
      title: "จัดส่งทั่วไทย",
      subtitle: "ส่งภายใน 1–3 วันทำการ",
      icon: <TruckIcon />,
    },
    {
      title: "ชำระเงินหลายช่องทาง",
      subtitle: "พร้อมเพย์ · บัตร · ปลายทาง",
      icon: <CardIcon />,
    },
    {
      title: "สินค้าของแท้",
      subtitle: "รับประกันจากร้าน 1 ปี",
      icon: <ShieldIcon />,
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="flex items-center gap-3 rounded-[10px] border border-subtle bg-background px-5 py-4"
        >
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[8px] bg-sunken text-ink">
            {item.icon}
          </span>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-ink">{item.title}</span>
            <span className="text-[12px] text-muted">{item.subtitle}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 3h15v13H1z" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3z" />
    </svg>
  );
}
