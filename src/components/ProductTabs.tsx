"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import { Review } from "@/lib/demo-data";

export default function ProductTabs({
  description,
  reviews,
}: {
  description: string;
  reviews: Review[];
}) {
  const [tab, setTab] = useState<"details" | "reviews">("details");

  return (
    <div className="mt-16">
      <div className="flex gap-8 border-b border-border">
        <button
          type="button"
          onClick={() => setTab("details")}
          className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
            tab === "details" ? "border-ink text-ink" : "border-transparent text-muted"
          }`}
        >
          รายละเอียดสินค้า
        </button>
        <button
          type="button"
          onClick={() => setTab("reviews")}
          className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
            tab === "reviews" ? "border-ink text-ink" : "border-transparent text-muted"
          }`}
        >
          รีวิวจากลูกค้า ({reviews.length})
        </button>
      </div>

      <div className="py-6">
        {tab === "details" ? (
          <p className="max-w-3xl text-sm leading-relaxed text-muted">{description}</p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-2 py-5 first:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{review.authorName}</p>
                  <span className="text-xs text-muted">{review.createdAt}</span>
                </div>
                <StarRating rating={review.rating} />
                <p className="text-sm text-muted">{review.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
