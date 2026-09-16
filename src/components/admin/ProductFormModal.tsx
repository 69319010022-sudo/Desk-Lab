"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createProductAction,
  updateProductAction,
  type AdminActionState,
} from "@/lib/actions/admin-catalog";
import type { AdminProduct, AdminCategory } from "@/lib/data/admin-catalog";
import { slugify } from "@/lib/slug";

const initialState: AdminActionState = null;

export default function ProductFormModal({
  product,
  categories,
  onClose,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onClose: () => void;
}) {
  const isEdit = product !== null;
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateProductAction : createProductAction,
    initialState,
  );
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);

  // ปิด modal อัตโนมัติเมื่อบันทึกสำเร็จ (ต้องใช้ useEffect ไม่ใช่เรียกตอน render ตรงๆ)
  useEffect(() => {
    if (state?.success) onClose();
  }, [state, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold text-ink">
          {isEdit ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
        </h3>

        <form action={formAction} className="mt-4 flex flex-col gap-4">
          {isEdit && <input type="hidden" name="id" value={product.id} />}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">ชื่อสินค้า</label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Slug (URL)</label>
            <input
              name="slug"
              required
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">SKU</label>
              <input
                name="sku"
                required
                defaultValue={product?.sku}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">หมวดหมู่</label>
              <select
                name="category_id"
                defaultValue={product?.categoryId ?? ""}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
              >
                <option value="">ไม่มีหมวดหมู่</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">ราคา (บาท)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={product?.price}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">จำนวนสต็อก</label>
              <input
                name="stock_quantity"
                type="number"
                min="0"
                required
                defaultValue={product?.stockQuantity}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">คำอธิบายสินค้า</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={product?.description}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ink"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">URL รูปสินค้า (ไม่บังคับ)</label>
            <input
              name="image_url"
              defaultValue={product?.imageUrl ?? ""}
              placeholder="/products/example.svg"
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product?.isActive ?? true}
              className="h-4 w-4 rounded border-border"
            />
            เปิดขายสินค้านี้
          </label>

          {state?.error && (
            <p className="rounded-lg border border-[color:var(--color-status-cancelled)]/30 bg-sunken px-3.5 py-2.5 text-sm text-[color:var(--color-status-cancelled)]">
              {state.error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
