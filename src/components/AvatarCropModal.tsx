"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const VIEWPORT_SIZE = 288; // ขนาดกรอบครอปที่แสดงบนจอ (px)
const OUTPUT_SIZE = 512; // ขนาดรูปที่ export ออกมา (px)
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type Offset = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function AvatarCropModal({
  imageSrc,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null);

  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // baseScale = สเกลที่ทำให้รูป "cover" กรอบสี่เหลี่ยมพอดีตอน zoom = 1
  const baseScale = naturalSize
    ? Math.max(VIEWPORT_SIZE / naturalSize.w, VIEWPORT_SIZE / naturalSize.h)
    : 1;
  const displayScale = baseScale * zoom;
  const displayWidth = naturalSize ? naturalSize.w * displayScale : VIEWPORT_SIZE;
  const displayHeight = naturalSize ? naturalSize.h * displayScale : VIEWPORT_SIZE;

  function clampToBounds(next: Offset, width: number, height: number): Offset {
    return {
      x: clamp(next.x, VIEWPORT_SIZE - width, 0),
      y: clamp(next.y, VIEWPORT_SIZE - height, 0),
    };
  }

  function handleImageLoad() {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const scale = Math.max(VIEWPORT_SIZE / w, VIEWPORT_SIZE / h);
    setNaturalSize({ w, h });
    setZoom(1);
    setOffset({
      x: (VIEWPORT_SIZE - w * scale) / 2,
      y: (VIEWPORT_SIZE - h * scale) / 2,
    });
  }

  function handleZoomChange(nextZoom: number) {
    if (!naturalSize) {
      setZoom(nextZoom);
      return;
    }
    const nextWidth = naturalSize.w * baseScale * nextZoom;
    const nextHeight = naturalSize.h * baseScale * nextZoom;
    setZoom(nextZoom);
    setOffset((prev) => clampToBounds(prev, nextWidth, nextHeight));
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragState.current = { startX: e.clientX, startY: e.clientY, startOffset: offset };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(
      clampToBounds(
        {
          x: dragState.current.startOffset.x + dx,
          y: dragState.current.startOffset.y + dy,
        },
        displayWidth,
        displayHeight,
      ),
    );
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    dragState.current = null;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img || !naturalSize) return;

    const sourceSize = VIEWPORT_SIZE / displayScale;
    const sourceX = -offset.x / displayScale;
    const sourceY = -offset.y / displayScale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsProcessing(true);
    ctx.drawImage(img, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    canvas.toBlob(
      (blob) => {
        setIsProcessing(false);
        if (blob) onConfirm(blob);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm space-y-4 rounded-2xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-base font-bold">ปรับตำแหน่งรูปโปรไฟล์</h3>
          <p className="mt-1 text-xs text-muted">ลากรูปเพื่อเลื่อนตำแหน่ง และเลื่อนแถบด้านล่างเพื่อซูม</p>
        </div>

        <div
          className="relative mx-auto touch-none select-none overflow-hidden rounded-full border border-border bg-surface"
          style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, cursor: isDragging ? "grabbing" : "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt=""
            draggable={false}
            onLoad={handleImageLoad}
            className="pointer-events-none absolute max-w-none"
            style={{ left: offset.x, top: offset.y, width: displayWidth, height: displayHeight }}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">ซูม</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            disabled={!naturalSize}
            className="flex-1"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!naturalSize || isProcessing}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? "กำลังบันทึก..." : "ยืนยัน"}
          </button>
        </div>
      </div>
    </div>
  );
}
