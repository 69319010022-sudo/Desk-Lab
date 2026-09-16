"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type AdminActionState,
} from "@/lib/actions/admin-catalog";
import type { AdminCategory } from "@/lib/data/admin-catalog";
import { slugify } from "@/lib/slug";

const initialState: AdminActionState = null;

function AddCategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategoryAction, initialState);
  const [name, setName] = useState("");

  useEffect(() => {
    // เคลียร์ช่องกรอกหลังเพิ่มสำเร็จ — เป็นการ sync UI กับผลลัพธ์ server action (external
    // system) ไม่ใช่ derived state จึงจำเป็นต้องใช้ effect ตรงนี้ (ปิด lint rule นี้เฉพาะจุด)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state?.success) setName("");
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-2 border-b border-border pb-4">
      <input
        name="name"
        required
        placeholder="ชื่อหมวดหมู่ใหม่"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ink"
      />
      <input type="hidden" name="slug" value={slugify(name)} />

        <button
          type="submit"
          disabled={isPending || !name.trim()}
          className="h-9 rounded-lg bg-ink text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "กำลังเพิ่ม..." : "+ เพิ่มหมวดหมู่"}
        </button>
        {state?.error && (
          <p className="text-xs text-[color:var(--color-status-cancelled)]">{state.error}</p>
        )}
      </form>
  );
}

function CategoryRow({ category }: { category: AdminCategory }) {
  const [state, formAction, isPending] = useActionState(updateCategoryAction, initialState);
  const [name, setName] = useState(category.name);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    // ปิดโหมดแก้ไขหลังบันทึกสำเร็จ — sync กับผลลัพธ์ server action เช่นเดียวกับด้านบน
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state?.success) setEditing(false);
  }, [state]);

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-2 py-2 text-sm">
        <span className="text-ink">{category.name}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-muted hover:text-ink hover:underline"
          >
            แก้ไข
          </button>
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              onClick={(e) => {
                if (
                  !confirm(
                    `ลบหมวดหมู่ "${category.name}" ใช่หรือไม่? (สินค้าที่อยู่ในหมวดนี้จะกลายเป็น "ไม่มีหมวดหมู่")`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
              className="text-xs font-medium text-[color:var(--color-status-cancelled)] hover:underline"
            >
              ลบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1.5 py-2">
      <input type="hidden" name="id" value={category.id} />
      <div className="flex gap-2">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 flex-1 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-ink"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-ink px-3 text-xs font-medium text-white disabled:opacity-50"
        >
          {isPending ? "..." : "บันทึก"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border border-border px-3 text-xs font-medium text-ink"
        >
          ยกเลิก
        </button>
      </div>
      {state?.error && (
        <p className="text-xs text-[color:var(--color-status-cancelled)]">{state.error}</p>
      )}
    </form>
  );
}

export default function CategoryPanel({ categories }: { categories: AdminCategory[] }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">หมวดหมู่สินค้า ({categories.length})</h2>
      <AddCategoryForm />
      <div className="mt-2 divide-y divide-border">
        {categories.map((c) => (
          <CategoryRow key={c.id} category={c} />
        ))}
      </div>
    </div>
  );
}
