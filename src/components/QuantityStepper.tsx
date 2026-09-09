"use client";

import { useState } from "react";

export default function QuantityStepper({
  initial = 1,
  min = 1,
  max = 99,
  onChange,
}: {
  initial?: number;
  min?: number;
  max?: number;
  onChange?: (quantity: number) => void;
}) {
  const [qty, setQty] = useState(initial);

  function update(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    setQty(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-border">
      <button
        type="button"
        onClick={() => update(qty - 1)}
        className="flex h-10 w-10 items-center justify-center text-lg text-muted transition-colors hover:bg-surface"
        aria-label="ลดจำนวน"
      >
        −
      </button>
      <span className="flex h-10 w-10 items-center justify-center text-sm font-medium">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => update(qty + 1)}
        className="flex h-10 w-10 items-center justify-center text-lg text-muted transition-colors hover:bg-surface"
        aria-label="เพิ่มจำนวน"
      >
        +
      </button>
    </div>
  );
}
