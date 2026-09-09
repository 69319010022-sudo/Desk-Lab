import { notFound } from "next/navigation";
import StarRating from "@/components/StarRating";
import ProductGallery from "@/components/ProductGallery";
import ProductTabs from "@/components/ProductTabs";
import ProductCard from "@/components/ProductCard";
import AddToCartForm from "./AddToCartForm";
import { formatBaht } from "@/lib/demo-data";
import {
  getCategories,
  getCategoryById,
  getProductBySlug,
  getRelatedProducts,
  getReviewsForProduct,
} from "@/lib/data/catalog";

// Product-Detail ปรับสไตล์ตาม Figma จริง (get_design_context, node-id=1:370
// "03 · Product-Detail — POS", fileKey UqD5VwG7M7IFPZMoFuoSo2) — คงฟังก์ชันเดิมที่ต่อ
// Supabase จริงและทดสอบผ่านแล้วทั้งหมดไว้ (ProductGallery/AddToCartForm/ProductTabs/
// ProductCard) เปลี่ยนแค่ชั้น layout/สไตล์ให้เข้าธีม POS เดียวกับหน้า Home/Shop
// (buy-panel การ์ดขอบมน + stock badge + ราคาตัวใหญ่แบบ mono) — Rail/TopBar ใช้ของ
// (site)/layout.tsx อยู่แล้ว ไม่วาดซ้ำ (ไฟล์อ้างอิงจาก Figma วาด Rail/TopBar ของตัวเอง
// มาด้วย ถูกตัดออก)

export async function generateMetadata(props: PageProps<"/product/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  return {
    title: product ? `${product.name} - DeskLab` : "สินค้า - DeskLab",
    description: product?.description || "ร้านขายของแต่งโต๊ะคอมออนไลน์ DeskLab",
  };
}

export default async function ProductDetailPage(
  props: PageProps<"/product/[slug]">,
) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [categories, productReviews, related] = await Promise.all([
    getCategories(),
    getReviewsForProduct(product.id),
    getRelatedProducts(product),
  ]);
  const category = getCategoryById(categories, product.categoryId);
  const inStock = product.stockQuantity > 0;

  return (
    <div className="flex flex-col gap-[40px] px-[28px] pb-[32px] pt-[24px]">
      <div className="grid grid-cols-1 gap-[32px] lg:grid-cols-[1fr_420px]">
        <ProductGallery productName={product.name} images={product.images} />

        <div className="flex h-fit flex-col gap-[20px] rounded-[12px] border border-subtle bg-background p-[24px]">
          {category && (
            <span className="text-[11px] font-medium uppercase tracking-[1.2px] text-faint">
              {category.name}
            </span>
          )}
          <h1 className="text-[32px] font-semibold leading-tight text-ink">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 text-sm text-muted">
            <StarRating rating={product.rating} />
            <span>({product.reviewCount} รีวิวจากผู้ซื้อจริง)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-muted">
              SKU: <span className="font-medium text-ink">{product.sku}</span>
            </span>
            <span
              className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium ${
                inStock
                  ? "bg-[color:var(--color-status-delivered)]/10 text-[color:var(--color-status-delivered)]"
                  : "bg-[color:var(--color-status-cancelled)]/10 text-[color:var(--color-status-cancelled)]"
              }`}
            >
              {inStock ? `มีสินค้า ${product.stockQuantity} ชิ้น` : "สินค้าหมด"}
            </span>
          </div>

          <p className="font-mono text-[28px] font-semibold tracking-[-0.2px] text-ink">
            {formatBaht(product.price)}
          </p>

          <AddToCartForm productId={product.id} stockQuantity={product.stockQuantity} />

          <div className="space-y-[10px] border-t border-subtle pt-[16px]">
            <h3 className="text-[11px] font-medium uppercase tracking-[1.2px] text-faint">
              รายละเอียดจัดส่ง
            </h3>
            <p className="text-[13px] text-muted">
              {category ? `หมวดหมู่: ${category.name}` : "อุปกรณ์ตกแต่งโต๊ะคอมพิวเตอร์"}
            </p>
            <p className="text-[13px] text-muted">
              จัดส่งฟรีเมื่อซื้อครบ 990 บาท · รับสินค้าใน 1-3 วันทำการ
            </p>
          </div>
        </div>
      </div>

      <ProductTabs description={product.description} reviews={productReviews} />

      {related.length > 0 && (
        <section className="flex flex-col gap-[16px]">
          <h2 className="text-[20px] font-medium text-ink">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 gap-[20px] md:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                categoryName={getCategoryById(categories, p.categoryId)?.name}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
