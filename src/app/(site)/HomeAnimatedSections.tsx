"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/demo-data";

// แยกไฟล์นี้ออกมาจาก page.tsx (2026-09-16) เพราะ motion.xxx เป็น Proxy ที่เรียก
// createMotionComponent() ทันทีตอน property ถูกอ่าน — ถ้าอ่านจากไฟล์ที่ไม่มี
// "use client" (เช่น page.tsx ซึ่งเป็น async Server Component ดึงข้อมูล Supabase)
// จะ error ตอน runtime บนเซิร์ฟเวอร์จริง (build ผ่านได้แต่ dev server รันจริงพัง)
// ไฟล์นี้จึงต้องมี "use client" แล้วรับข้อมูลเป็น props จาก page.tsx แทน

const categoryBlockColors = ["#fde68a", "#bfdbfe", "#bbf7d0", "#fecaca", "#ddd6fe"];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function HeroSection({ productCount }: { productCount: number }) {
  const facts = [
    { value: String(productCount), label: "รายการในร้าน" },
    { value: "3", label: "ช่องทางชำระเงิน" },
    { value: "1-3 วัน", label: "จัดส่งทั่วไทย" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col gap-8 overflow-hidden rounded-[16px] bg-footer p-[36px] text-white md:flex-row md:items-center md:justify-between"
    >
      <div className="flex max-w-xl flex-1 flex-col gap-5 md:max-w-none">
        <h1 className="text-[28px] font-bold leading-[1.15] sm:text-[34px] md:whitespace-nowrap md:text-[clamp(28px,3.2vw,48px)]">
          จัดโต๊ะทำงานให้ครบในที่เดียว
        </h1>
        <p className="max-w-xl text-[14px] leading-relaxed text-white/70 md:text-[15px]">
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
    </motion.section>
  );
}

export function CategoryRow({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[16px] font-semibold text-ink">หมวดหมู่ยอดนิยม</h2>
      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {categories.map((cat, i) => (
          <motion.div key={cat.id} variants={itemVariants} className="h-full">
            <Link
              href={`/shop?category=${cat.slug}`}
              className="flex h-full items-center gap-3 rounded-[10px] border border-subtle bg-background px-4 py-3.5 transition-colors hover:bg-sunken"
            >
              <span
                className="flex size-[36px] shrink-0 items-center justify-center rounded-[8px] text-ink"
                style={{ backgroundColor: categoryBlockColors[i % categoryBlockColors.length] }}
              >
                <CategoryIcon slug={cat.slug} />
              </span>
              <span className="truncate text-[13px] font-medium text-ink">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ไอคอนหมวดหมู่บนหน้าแรก — วาดเป็น inline SVG line-icon สไตล์เดียวกับที่ใช้ใน
// AdminRail.tsx (viewBox 18x18, stroke="currentColor", strokeWidth 1.5) แทนที่การ
// โชว์ตัวอักษรแรกของชื่อหมวดหมู่แบบเดิม ซึ่งตัวอักษรไทยบางตัวเรนเดอร์เล็กจนดูเหมือน
// ตัวอังกฤษ และหลายหมวดขึ้นต้นด้วยคำเดียวกัน ("ที่...") ทำให้แยกไม่ออก
function CategoryIcon({ slug }: { slug: string }) {
  switch (slug) {
    case "lamp":
      return <LampCategoryIcon />;
    case "mousepad":
      return <MousepadCategoryIcon />;
    case "monitor-stand":
      return <MonitorStandCategoryIcon />;
    case "speaker":
      return <SpeakerCategoryIcon />;
    case "headphone-stand":
      return <HeadphoneCategoryIcon />;
    case "keyboard":
      return <KeyboardCategoryIcon />;
    case "charging-power":
      return <ChargingCategoryIcon />;
    case "desk-organizer":
      return <OrganizerCategoryIcon />;
    default:
      return <DefaultCategoryIcon />;
  }
}

const categoryIconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 18 18",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// โคมไฟ
function LampCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <path d="M3.5 15.5h6" />
      <path d="M6.5 15.5V10" />
      <path d="M6.5 10 11 7" />
      <path d="M9.3 3.6 14.5 5.6 12 9 7.3 7.2Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

// แผ่นรองเมาส์
function MousepadCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <rect x="2" y="4" width="14" height="10" rx="3" />
      <rect x="7.5" y="6" width="3" height="7" rx="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ที่วางจอ
function MonitorStandCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <rect x="2" y="2.5" width="14" height="9" rx="1.5" />
      <path d="M9 11.5v2.5" />
      <path d="M5.5 15.5h7" />
    </svg>
  );
}

// ลำโพง
function SpeakerCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <rect x="5" y="1.5" width="8" height="15" rx="2" />
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="9" cy="11.5" r="2.6" />
    </svg>
  );
}

// ที่วางหูฟัง
function HeadphoneCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <path d="M3 10.5v-1a6 6 0 0 1 12 0v1" />
      <rect x="2" y="10" width="3" height="5" rx="1.4" />
      <rect x="13" y="10" width="3" height="5" rx="1.4" />
    </svg>
  );
}

// คีย์บอร์ด
function KeyboardCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <rect x="1.5" y="4.5" width="15" height="9" rx="1.5" />
      <rect x="4" y="7" width="1.6" height="1.6" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="7.2" y="7" width="1.6" height="1.6" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="10.4" y="7" width="1.6" height="1.6" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="13.6" y="7" width="1.6" height="1.6" rx="0.4" fill="currentColor" stroke="none" />
      <rect x="4" y="10.2" width="10" height="1.6" rx="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ที่ชาร์จและปลั๊กไฟ
function ChargingCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <path d="M6 2v4M12 2v4" />
      <path d="M4.5 6h9v3a4.5 4.5 0 0 1-9 0V6Z" />
      <path d="M9 13.5V16" />
    </svg>
  );
}

// ที่จัดระเบียบโต๊ะ
function OrganizerCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <rect x="1.5" y="5" width="15" height="9" rx="1.5" />
      <path d="M6.5 5v9M11.5 5v9" />
      <path d="M1.5 9h4M11.5 9h5" />
    </svg>
  );
}

// ไอคอนสำรอง (เผื่อมีหมวดหมู่ใหม่ในอนาคตที่ยังไม่มีไอคอนเฉพาะ)
function DefaultCategoryIcon() {
  return (
    <svg {...categoryIconProps}>
      <rect x="2" y="2" width="6" height="6" rx="1.2" />
      <rect x="10" y="2" width="6" height="6" rx="1.2" />
      <rect x="2" y="10" width="6" height="6" rx="1.2" />
      <rect x="10" y="10" width="6" height="6" rx="1.2" />
    </svg>
  );
}

export function FeaturedGrid({
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
      <motion.div
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants}>
            <ProductCard
              product={product}
              categoryName={categoryNameById.get(product.categoryId)}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
