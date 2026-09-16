"use client";

import { useActionState, useState } from "react";
import { formatBaht } from "@/lib/demo-data";
import type { AdminProduct, AdminCategory } from "@/lib/data/admin-catalog";
import { deleteProductAction, toggleProductActiveAction, type AdminActionState } from "@/lib/actions/admin-catalog";
import ProductFormModal from "./ProductFormModal";
import CategoryPanel from "./CategoryPanel";

const initialState: AdminActionState = null;

function ToggleActiveButton({ id, isActive }: { id: number; isActive: boolean }) {
  return (
    <form action={toggleProductActiveAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="next_active" value={(!isActive).toString()} />
      <button type="submit" className="text-xs font-medium text-muted hover:text-ink hover:underline">
        {isActive ? "ปิดการขาย" : "เปิดการขาย"}
      </button>
    </form>
  );
}

function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const [state, formAction, isPending] = useActionState(deleteProductAction, initialState);
  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={isPending}
        onClick={(e) => {
          if (!confirm(`ลบ "${name}" ใช่หรือไม่?`)) e.preventDefault();
        }}
        className="text-xs font-medium text-[color:var(--color-status-cancelled)] hover:underline disabled:opacity-50"
      >
        {isPending ? "กำลังลบ..." : "ลบ"}
      </button>
      {state?.error && (
        <span className="max-w-[160px] text-right text-[11px] text-[color:var(--color-status-cancelled)]">
          {state.error}
        </span>
      )}
    </form>
  );
}

export default function ProductsManager({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
}) {
  const [modalProduct, setModalProduct] = useState<AdminProduct | "new" | null>(null);

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="flex-1 rounded-2xl border border-border bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">สินค้าทั้งหมด ({products.length})</h2>
          <button
            onClick={() => setModalProduct("new")}
            className="rounded-lg bg-ink px-4 py-2 text-xs font-medium text-white transition hover:opacity-90"
          >
            + เพิ่มสินค้า
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">สินค้า</th>
                <th className="py-2 pr-4 font-medium">หมวดหมู่</th>
                <th className="py-2 pr-4 font-medium">ราคา</th>
                <th className="py-2 pr-4 font-medium">สต็อก</th>
                <th className="py-2 pr-4 font-medium">สถานะ</th>
                <th className="py-2 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-border/60 align-top last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="h-10 w-10 rounded-lg border border-border object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg border border-dashed border-border bg-sunken" />
                      )}

                      <div>
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="text-xs text-muted">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted">{product.categoryName ?? "ไม่มีหมวดหมู่"}</td>
                  <td className="py-3 pr-4 font-mono text-ink">{formatBaht(product.price)}</td>
                  <td className="py-3 pr-4 font-mono text-ink">{product.stockQuantity}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        product.isActive
                          ? "bg-[color:var(--color-status-delivered-bg)] text-[color:var(--color-status-delivered)]"
                          : "bg-sunken text-muted"
                      }`}
                    >
                      {product.isActive ? "กำลังขาย" : "ปิดการขาย"}
                    </span>
                  </td>

                  <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        onClick={() => setModalProduct(product)}
                        className="text-xs font-medium text-muted hover:text-ink hover:underline"
                      >
                        แก้ไข
                      </button>
                      <ToggleActiveButton id={product.id} isActive={product.isActive} />
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="py-8 text-center text-sm text-muted">ยังไม่มีสินค้าในระบบ</p>
          )}
        </div>
      </div>

      <div className="w-full xl:w-[300px]">
        <CategoryPanel categories={categories} />
      </div>

      {modalProduct && (
        <ProductFormModal
          categories={categories}
          product={modalProduct === "new" ? null : modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  );
}
