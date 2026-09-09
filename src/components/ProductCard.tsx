import Link from "next/link";
import { Product, formatBaht } from "@/lib/demo-data";
import { addToCart } from "@/lib/actions/cart";

// Tile/Product ดึงมาจาก Figma จริง (get_design_context, node 1:300 "01 · Home — POS")
// รูปสูง 176px, eyebrow หมวดหมู่ (ถ้ามีส่งเข้ามา), ชื่อสินค้า, แถวราคา + ปุ่ม "+" สี่เหลี่ยมเล็ก
// แทนปุ่มข้อความเต็มความกว้างแบบเดิม — categoryName เป็น optional เพื่อไม่กระทบหน้าที่ยังไม่ได้อัปเดต

export default function ProductCard({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const inStock = product.stockQuantity > 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-[8px] border border-subtle bg-background transition-shadow hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="flex h-[176px] items-center justify-center overflow-clip rounded-t-[8px] bg-sunken text-muted">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <ImagePlaceholderIcon />
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-[10px] px-[14px] pb-[14px] pt-[12px]">
        {categoryName && (
          <p className="text-[11px] uppercase tracking-[1.2px] text-faint">
            {categoryName}
          </p>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 text-[14px] font-medium text-ink hover:underline">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <p className="font-mono text-[20px] font-semibold tracking-[-0.2px] text-ink">
            {formatBaht(product.price)}
          </p>
          <form action={addToCart}>
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="quantity" value={1} />
            <button
              type="submit"
              disabled={!inStock}
              aria-label={inStock ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
              className="flex size-[36px] items-center justify-center rounded-[8px] bg-ink text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-faint"
            >
              <PlusIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ImagePlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
