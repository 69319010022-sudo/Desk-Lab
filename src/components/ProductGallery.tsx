"use client";

import { useState } from "react";
import { ImagePlaceholderIcon } from "./ProductCard";

export default function ProductGallery({
  productName,
  images = [],
}: {
  productName: string;
  images?: string[];
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex aspect-square items-center justify-center rounded-xl bg-surface text-muted">
          <div className="flex flex-col items-center gap-2">
            <ImagePlaceholderIcon />
            <span className="text-sm">ยังไม่มีรูปภาพสินค้านี้</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex aspect-square items-center justify-center rounded-xl bg-surface p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${productName} รูปที่ ${active + 1}`}
          className="h-full w-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`ดูรูปที่ ${i + 1} ของ ${productName}`}
              className={`flex aspect-square items-center justify-center rounded-lg border bg-surface p-2 transition-colors ${
                active === i ? "border-ink" : "border-transparent hover:border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
