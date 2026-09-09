"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { Category, Product } from "@/lib/demo-data";

// ส่วนที่ต้องมี interactivity ของหน้า Shop (ค้นหา + ชิปหมวดหมู่) แยกเป็น client
// component เล็กๆ ตัวเดียว กรองฝั่ง client เพราะสินค้ามีแค่ ~10 ชิ้น (ตามที่ระบุไว้ใน
// SHOP-PAGE-SETUP.md ข้อ "Known Limitations") ถ้าสินค้าเยอะขึ้นมากค่อยย้ายไปกรองฝั่งเซิร์ฟเวอร์ทีหลัง
export default function ShopCatalog({
  categories,
  products,
  categoryNameById,
}: {
  categories: Category[];
  products: Product[];
  categoryNameById: Map<number, string>;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = selectedCategoryId === null || p.categoryId === selectedCategoryId;
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategoryId, query]);

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex h-[42px] max-w-md items-center gap-[10px] rounded-[10px] border border-subtle bg-background px-[14px]">
        <SearchIcon />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาสินค้า ชื่อ หรือรหัส SKU"
          className="flex-1 bg-transparent text-[14px] text-ink placeholder-faint outline-none"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategoryId(null)}
          className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors ${
            selectedCategoryId === null
              ? "bg-ink text-white"
              : "border border-default bg-background text-muted hover:bg-sunken"
          }`}
        >
          ทั้งหมด
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategoryId(cat.id)}
            className={`h-9 shrink-0 rounded-full px-4 text-[13px] font-medium whitespace-nowrap transition-colors ${
              selectedCategoryId === cat.id
                ? "bg-ink text-white"
                : "border border-default bg-background text-muted hover:bg-sunken"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[14px] font-medium text-ink">สินค้าทั้งหมด</span>
        <span className="font-mono text-[13px] font-medium text-muted">
          {filtered.length} รายการ
        </span>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-[20px] md:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categoryNameById.get(product.categoryId)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-16 text-center">
          <p className="text-[14px] text-muted">ไม่พบสินค้า</p>
          <p className="text-[12px] text-faint">ลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
        </div>
      )}
    </div>
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
      className="shrink-0 text-faint"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
