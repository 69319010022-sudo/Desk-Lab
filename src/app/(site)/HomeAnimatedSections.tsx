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
                className="flex size-[36px] shrink-0 items-center justify-center rounded-[8px] text-[14px] font-semibold text-ink"
                style={{ backgroundColor: categoryBlockColors[i % categoryBlockColors.length] }}
              >
                {cat.name.charAt(0)}
              </span>
              <span className="truncate text-[13px] font-medium text-ink">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
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
