"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
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
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3">
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
    <div className="mx-auto flex w-full max-w-[480px] flex-col gap-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={active}
            src={images[active]}
            alt={`${productName} รูปที่ ${active + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full object-contain"
          />
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((src, i) => (
            <motion.button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`ดูรูปที่ ${i + 1} ของ ${productName}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className={`flex aspect-square items-center justify-center rounded-lg border bg-surface p-2 transition-colors ${
                active === i ? "border-ink" : "border-transparent hover:border-border"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-contain" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
