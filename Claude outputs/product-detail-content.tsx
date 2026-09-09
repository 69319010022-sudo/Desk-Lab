'use client';

import { useState, useCallback } from 'react';
import { Product } from '@/lib/types';
import { addToCartAction } from '@/lib/actions/cart';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProductDetailProps {
  product: Product & {
    description?: string;
    category_name?: string;
    sku: string;
    stock_quantity: number;
  };
  relatedProducts: Product[];
  cartCount: number;
  cartTotal: number;
  currentCartItems?: Array<{
    id: string;
    productId: string;
    quantity: number;
    product: {
      name: string;
      price: number;
      images?: string[];
    };
  }>;
}

type TabType = 'description' | 'reviews' | 'shipping';

export function ProductDetailContent({
  product,
  relatedProducts,
  cartCount,
  cartTotal,
  currentCartItems = [],
}: ProductDetailProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [searchQuery, setSearchQuery] = useState('');

  const images = product.images || [];
  const mainImage = images[selectedImageIndex] || null;

  const handleAddToCart = useCallback(
    async (type: 'cart' | 'buy') => {
      setIsAddingToCart(true);
      try {
        const result = await addToCartAction(product.id, quantity);
        if (result.success) {
          if (type === 'buy') {
            // Navigate to checkout
            router.push('/checkout');
          } else {
            // Just refresh to update cart
            router.refresh();
            setQuantity(1);
          }
        } else {
          console.error('Failed to add to cart:', result.error);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [product.id, quantity, router]
  );

  const isInStock = product.stock_quantity > 0;

  return (
    <div className="flex h-screen w-full bg-[#fafafa]">
      {/* Left Rail */}
      <div className="w-[76px] shrink-0 flex-col gap-[8px] bg-[#1a1a1a] py-[20px] flex items-center">
        <Link
          href="/shop"
          className="flex size-[40px] items-center justify-center rounded-[11px] bg-white"
        >
          <span className="font-prompt text-[13px] font-medium text-[#1a1a1a]">DL</span>
        </Link>
        <div className="h-[14px] w-[60px]" />
        {[
          { icon: '⌂', label: 'หน้าแรก', href: '/' },
          { icon: '⊞', label: 'สินค้า', href: '/shop' },
          { icon: '🛒', label: 'ตะกร้า', href: '/cart' },
          { icon: '📋', label: 'คำสั่งซื้อ', href: '/orders' },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex h-[58px] w-[60px] flex-col items-center justify-center gap-[5px] rounded-[10px]"
          >
            <div className="text-[18px]">{item.icon}</div>
            <span className="font-prompt text-[10px] font-medium uppercase tracking-[0.2px] text-[rgba(255,255,255,0.5)]">
              {item.label}
            </span>
          </Link>
        ))}
        <div className="flex-1" />
        <Link
          href="/account"
          className="flex h-[58px] w-[60px] flex-col items-center justify-center gap-[5px] rounded-[10px]"
        >
          <div className="text-[18px]">👤</div>
          <span className="font-prompt text-[10px] font-medium uppercase tracking-[0.2px] text-[rgba(255,255,255,0.5)]">
            บัญชี
          </span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Bar */}
        <div className="flex h-[68px] shrink-0 items-center border-b border-[#ebebed] bg-white px-[28px] gap-[20px]">
          <div className="flex flex-1 flex-col gap-[2px]">
            <h1 className="font-prompt text-[20px] font-medium text-[#1a1a1a]">รายละเอียดสินค้า</h1>
            <p className="font-prompt text-[12px] text-[#9a9aa0]">DeskLab · {product.category_name || 'สินค้า'}</p>
          </div>

          {/* Search */}
          <div className="flex flex-1 max-w-md items-center gap-[10px] rounded-[10px] bg-[#f4f4f5] px-[14px] h-[42px]">
            <svg className="size-[16px] shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาสินค้า ชื่อ หรือรหัส SKU"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent font-prompt text-[14px] text-[#9a9aa0] placeholder-[#9a9aa0] outline-none"
            />
          </div>

          {/* Cart Badge */}
          <div className="flex h-[42px] shrink-0 items-center gap-[12px] rounded-[10px] bg-[#1a1a1a] px-[16px]">
            <span className="font-prompt text-[13px] font-medium text-white">ตะกร้า {cartCount}</span>
            <div className="h-[18px] w-px bg-[rgba(255,255,255,0.25)]" />
            <span className="font-plex-mono text-[13px] font-medium text-white">฿{cartTotal.toLocaleString('th-TH')}</span>
          </div>

          {/* Profile Avatar */}
          <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full border border-[#d9d9dc] bg-[#f4f4f5]">
            <span className="font-prompt text-[12px] text-[#6b6b70]">PP</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-[28px] py-[24px]">
          {/* Product Detail Section */}
          <div className="flex gap-[32px] mb-[48px]">
            {/* Left: Image Gallery */}
            <div className="flex flex-col gap-[16px] shrink-0">
              {/* Main Image */}
              <div className="w-[470px] h-[470px] rounded-[12px] bg-[#f4f4f5] border border-[#ebebed] flex items-center justify-center overflow-hidden">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-[#9a9aa0] text-[48px]">📷</div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-[12px]">
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-[96px] h-[96px] rounded-[8px] border-2 flex items-center justify-center bg-[#f4f4f5] overflow-hidden transition-all ${
                        selectedImageIndex === idx ? 'border-[#1a1a1a]' : 'border-[#ebebed]'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Buy Panel */}
            <div className="w-[420px] shrink-0 rounded-[12px] border border-[#ebebed] bg-white p-[24px] h-fit space-y-[20px]">
              {/* Category */}
              <span className="font-prompt text-[11px] font-medium uppercase tracking-[1.2px] text-[#9a9aa0]">
                {product.category_name || 'สินค้า'}
              </span>

              {/* Product Name */}
              <h1 className="font-prompt text-[32px] font-semibold text-[#1a1a1a] leading-tight">
                {product.name}
              </h1>

              {/* SKU & Stock Badge */}
              <div className="flex items-center justify-between">
                <span className="font-prompt text-[13px] text-[#6b6b70]">
                  SKU: <span className="font-medium text-[#1a1a1a]">{product.sku}</span>
                </span>
                <div
                  className={`px-[12px] py-[6px] rounded-[6px] font-prompt text-[12px] font-medium ${
                    isInStock
                      ? 'bg-[#e6f4e6] text-[#2d7a2d]'
                      : 'bg-[#f4e6e6] text-[#7a2d2d]'
                  }`}
                >
                  {isInStock ? `มีสินค้า ${product.stock_quantity} ชิ้น` : 'หมดสินค้า'}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-[8px]">
                <span className="font-plex-mono text-[28px] font-semibold text-[#1a1a1a]">
                  ฿{product.price.toLocaleString('th-TH')}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-[12px]">
                <span className="font-prompt text-[13px] text-[#6b6b70]">จำนวน</span>
                <div className="flex items-center border border-[#d9d9dc] rounded-[8px] h-[42px] overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!isInStock}
                    className="w-[40px] h-full flex items-center justify-center text-[18px] hover:bg-[#f4f4f5] disabled:opacity-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setQuantity(Math.min(Math.max(1, val), product.stock_quantity));
                    }}
                    className="w-[40px] h-full text-center font-prompt text-[14px] font-medium border-0 outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={!isInStock}
                    className="w-[40px] h-full flex items-center justify-center text-[18px] hover:bg-[#f4f4f5] disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart('cart')}
                disabled={!isInStock || isAddingToCart}
                className="w-full h-[48px] rounded-[10px] bg-[#1a1a1a] font-prompt text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isAddingToCart ? '⏳ กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
              </button>

              {/* Buy Now Button */}
              <button
                onClick={() => handleAddToCart('buy')}
                disabled={!isInStock || isAddingToCart}
                className="w-full h-[48px] rounded-[10px] border border-[#d9d9dc] font-prompt text-[14px] font-medium text-[#1a1a1a] transition-colors hover:bg-[#f4f4f5] disabled:opacity-50"
              >
                {isAddingToCart ? '⏳ กำลังเพิ่ม...' : 'ซื้อเลย'}
              </button>

              {/* Divider */}
              <div className="h-px bg-[#ebebed]" />

              {/* Specifications */}
              <div className="space-y-[12px]">
                <h3 className="font-prompt text-[11px] font-medium uppercase tracking-[1.2px] text-[#9a9aa0]">
                  ลักษณะเฉพาะ
                </h3>
                {[
                  { label: 'ประเภทสวิตช์', value: 'Mechanical Switch' },
                  { label: 'การเชื่อมต่อ', value: 'Wireless / USB-C' },
                  { label: 'เลย์เอาต์', value: '65% Compact' },
                  { label: 'ระยะเวลาการจัดส่ง', value: '1-3 วันทำการ' },
                ].map((spec, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <span className="font-prompt text-[13px] text-[#6b6b70]">{spec.label}</span>
                    <span className="font-prompt text-[13px] font-medium text-[#1a1a1a] text-right">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="space-y-[24px] mb-[48px]">
            {/* Tab Buttons */}
            <div className="flex gap-[32px] border-b border-[#ebebed]">
              {[
                { id: 'description', label: 'รายละเอียดสินค้า' },
                { id: 'reviews', label: 'รีวิวจากลูกค้า (12)' },
                { id: 'shipping', label: 'การจัดส่ง' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`pb-[12px] font-prompt text-[14px] font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]'
                      : 'text-[#6b6b70] border-b-2 border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'description' && (
              <div className="max-w-2xl">
                <p className="font-prompt text-[14px] leading-relaxed text-[#6b6b70]">
                  {product.description ||
                    'คีย์บอร์ดเมคานิคอลแบบ 65% ที่มีการออกแบบที่หรูหราและสมบูรณ์ด้วยการใช้สวิตช์คุณภาพสูงและเปลือกพลาสติก ABS ที่มีความเสถียรมากขึ้น เหมาะสำหรับการใช้งานประจำวัน และการเล่นเกม ที่มีจำนวนปุ่ม 68 ปุ่ม วางเรียงตามมาตรฐาน ANSI Layout ที่มั่นคง พร้อมสนับสนุน Wireless และ Wired Mode'}
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-[32px] text-[#9a9aa0]">
                <p className="font-prompt text-[14px]">ยังไม่มีรีวิว</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="max-w-2xl space-y-[12px]">
                <p className="font-prompt text-[14px] text-[#6b6b70]">
                  ⏱️ <strong>ระยะเวลาการจัดส่ง:</strong> 1-3 วันทำการ
                </p>
                <p className="font-prompt text-[14px] text-[#6b6b70]">
                  💰 <strong>ค่าจัดส่ง:</strong> ฿50 (ทั่วประเทศ)
                </p>
                <p className="font-prompt text-[14px] text-[#6b6b70]">
                  📦 <strong>บรรจุภัณฑ์:</strong> บรรจุอย่างปลอดภัยด้วยกล่องแข็งและโพลีสไตรีน
                </p>
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="space-y-[16px]">
              <h2 className="font-prompt text-[20px] font-medium text-[#1a1a1a]">สินค้าที่เกี่ยวข้อง</h2>
              <div className="grid grid-cols-4 gap-[20px]">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/product/${relatedProduct.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[12px] border border-[#ebebed] bg-white transition-shadow hover:shadow-md"
                  >
                    {/* Product Image */}
                    <div className="relative h-[176px] w-full overflow-hidden rounded-[8px] bg-[#f4f4f5] m-3 mb-0">
                      {relatedProduct.images && relatedProduct.images[0] ? (
                        <img
                          src={relatedProduct.images[0]}
                          alt={relatedProduct.name}
                          className="h-full w-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-[#9a9aa0]">
                          📷
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-1 flex-col gap-[10px] p-[14px]">
                      <span className="font-prompt text-[11px] font-medium uppercase tracking-[1.2px] text-[#9a9aa0]">
                        {relatedProduct.category_name || 'สินค้า'}
                      </span>
                      <h3 className="font-prompt text-[14px] font-medium text-[#1a1a1a] line-clamp-2">
                        {relatedProduct.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-plex-mono text-[16px] font-semibold text-[#1a1a1a]">
                          ฿{relatedProduct.price.toLocaleString('th-TH')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
