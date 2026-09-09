import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategories, getProducts } from "@/lib/data/catalog";
import type { Category, Product } from "@/lib/demo-data";

// Home ดึงมาจาก Figma จริง (get_design_context, node 1:300 "01 · Home — POS",
// fileKey UqD5VwG7M7IFPZMoFuoSo2) — hero การ์ดมืดทรงกลม + แผง "facts" ด้านขวา,
// แถวหมวดหมู่ 5 อันดับแรก (นับจากสินค้าจริง มากไปน้อย) พร้อมไอคอน flat color-block
// (ตัวอักษรแรกของชื่อหมวด แทน emoji เดิม เพราะยังไม่มีไฟล์ไอคอนจริงจากดีไซน์),
// กริดสินค้าแนะนำ 4 ชิ้นด้วย Tile/Product ใหม่, และแถบความน่าเชื่อถือ 3 คอลัมน์ท้ายหน้า
// ข้อมูลทั้งหมดยังคงดึงจริงจาก Supabase เหมือนเดิม ไม่มีตัวเลขสมมติ

const categoryBlockColors = ["#fde68a", "#bfdbfe", "#bbf7d0", "#fecaca", "#ddd6fe"];

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

function HeroSection({ productCount }: { productCount: number }) {
  const facts = [
    { value: String(productCount), label: "รายการในร้าน" },
    { value: "3", label: "ช่องทางชำระเงิน" },
    { value: "1-3 วัน", label: "จัดส่งทั่วไทย" },
  ];

  return (
    <section className="flex flex-col gap-8 overflow-hidden rounded-[16px] bg-footer p-[36px] text-white md:flex-row md:items-center md:justify-between">
      <div className="flex max-w-xl flex-col gap-5">
        <h1 className="text-[40px] font-bold leading-[1.1] md:text-[48px]">
          จัดโต๊ะทำงานให้ครบ
          <br />
          ในที่เดียว
        </h1>
        <p className="text-[14px] leading-relaxed text-white/70 md:text-[15px]">
          อุปกรณ์จัดโต๊ะคอมพิวเตอร์ครบวงจร ตั้งแต่โคมไฟ ที่รองเมาส์ ไปจนถึง
          ลำโพงและขาตั้งจอ เลือกได้ในที่เดียว พร้อมจัดส่งทั่วประเทศไทย
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-white/90"
          >
            เลือกซื้อสินค้า
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center rounded-lg border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            ดูหมวดหมู่ทั้งหมด
          </Link>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-4 rounded-[12px] bg-white/10 p-6 sm:flex-row md:flex-col md:w-[220px]">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-0.5">
            <span className="font-mono text-[22px] font-semibold tracking-[-0.2px]">
              {fact.value}
            </span>
            <span className="text-[12px] text-white/60">{fact.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CategoryRow({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-ink">หมวดหมู่ยอดนิยม</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="flex items-center gap-3 rounded-[10px] border border-subtle bg-background px-4 py-3.5 transition-colors hover:bg-sunken"
          >
            <span
              className="flex size-[36px] shrink-0 items-center justify-center rounded-[8px] text-[14px] font-semibold text-ink"
              style={{ backgroundColor: categoryBlockColors[i % categoryBlockColors.length] }}
            >
              {cat.name.charAt(0)}
            </span>
            <span className="truncate text-[13px] font-medium text-ink">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FeaturedGrid({
  products,
  categoryNameById,
}: {
  products: Product[];
  categoryNameById: Map<number, string>;
}) {
  if (products.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-ink">สินค้าแนะนำ</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            categoryName={categoryNameById.get(product.categoryId)}
          />
        ))}
      </div>
    </section>
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
