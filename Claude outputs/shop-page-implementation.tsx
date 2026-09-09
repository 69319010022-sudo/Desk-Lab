'use client';

import { useState, useCallback } from 'react';
import { Category, Product } from '@/lib/types';
import { addToCartAction } from '@/lib/actions/cart';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ShopPageProps {
  categories: Category[];
  products: Product[];
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

export function ShopPageContent({
  categories,
  products: initialProducts,
  cartCount,
  cartTotal,
  currentCartItems = [],
}: ShopPageProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  // Filter products by category and search
  const filteredProducts = initialProducts.filter((product) => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      setIsAddingToCart(productId);
      try {
        const result = await addToCartAction(productId, quantity);
        if (result.success) {
          router.refresh();
        } else {
          console.error('Failed to add to cart:', result.error);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsAddingToCart(null);
      }
    },
    [router]
  );

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
          { icon: '⊞', label: 'สินค้า', href: '/shop', active: true },
          { icon: '🛒', label: 'ตะกร้า', href: '/cart' },
          { icon: '📋', label: 'คำสั่งซื้อ', href: '/orders' },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex h-[58px] w-[60px] flex-col items-center justify-center gap-[5px] rounded-[10px] ${
              item.active ? 'bg-[rgba(255,255,255,0.1)]' : ''
            }`}
          >
            <div className="text-[18px]">{item.icon}</div>
            <span
              className={`font-prompt text-[10px] font-medium uppercase tracking-[0.2px] ${
                item.active ? 'text-white' : 'text-[rgba(255,255,255,0.5)]'
              }`}
            >
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
            <h1 className="font-prompt text-[20px] font-medium text-[#1a1a1a]">เลือกสินค้า</h1>
            <p className="font-prompt text-[12px] text-[#9a9aa0]">DeskLab · หน้าร้าน</p>
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
        <div className="flex flex-1 gap-[24px] overflow-hidden px-[28px] py-[24px] pb-[28px]">
          {/* Catalog */}
          <div className="flex flex-1 flex-col gap-[20px] min-w-0 overflow-y-auto">
            {/* Categories */}
            <div className="flex gap-[8px] overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`h-[36px] shrink-0 rounded-full px-[16px] font-prompt text-[13px] font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-[#1a1a1a] text-white'
                    : 'border border-[#d9d9dc] bg-white text-[#6b6b70] hover:bg-[#f4f4f5]'
                }`}
              >
                ทั้งหมด
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-[36px] shrink-0 rounded-full px-[16px] font-prompt text-[13px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[#1a1a1a] text-white'
                      : 'border border-[#d9d9dc] bg-white text-[#6b6b70] hover:bg-[#f4f4f5]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[8px]">
                <span className="font-prompt text-[14px] font-medium text-[#1a1a1a]">สินค้าทั้งหมด</span>
                <span className="font-plex-mono text-[13px] font-medium text-[#6b6b70]">
                  {filteredProducts.length} รายการ
                </span>
              </div>
              <span className="font-prompt text-[13px] font-medium text-[#6b6b70]">เรียงตาม · ยอดนิยม</span>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-3 gap-[20px] auto-rows-max">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[12px] border border-[#ebebed] bg-white transition-shadow hover:shadow-md"
                >
                  {/* Product Image */}
                  <div className="relative h-[176px] w-full overflow-hidden rounded-[8px] bg-[#f4f4f5] m-3 mb-0">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
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
                      {product.category_name || 'สินค้า'}
                    </span>
                    <h3 className="font-prompt text-[14px] font-medium text-[#1a1a1a] line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price & Add Button */}
                    <div className="flex items-center justify-between">
                      <span className="font-plex-mono text-[20px] font-semibold text-[#1a1a1a]">
                        ฿{product.price.toLocaleString('th-TH')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product.id);
                        }}
                        disabled={isAddingToCart === product.id}
                        className="flex size-[36px] items-center justify-center rounded-[8px] bg-[#1a1a1a] font-prompt text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {isAddingToCart === product.id ? '⏳' : '+'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="flex flex-1 items-center justify-center text-center">
                <div>
                  <p className="font-prompt text-[14px] text-[#6b6b70]">ไม่พบสินค้า</p>
                  <p className="font-prompt text-[12px] text-[#9a9aa0]">ลองเปลี่ยนหมวดหมู่หรือคำค้นหา</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="flex w-[340px] shrink-0 flex-col gap-[16px] overflow-y-auto">
            {/* Current Cart */}
            <div className="rounded-[12px] border border-[#ebebed] bg-white p-[18px]">
              <div className="mb-[12px] flex items-center justify-between pb-[12px]">
                <span className="font-prompt text-[11px] font-medium uppercase tracking-[1.2px] text-[#9a9aa0]">
                  ตะกร้าปัจจุบัน
                </span>
                <span className="font-plex-mono text-[13px] font-medium text-[#6b6b70]">
                  {cartCount} ชิ้น
                </span>
              </div>

              {currentCartItems.length > 0 ? (
                <div className="space-y-0 divide-y divide-[#ebebed]">
                  {currentCartItems.map((item) => (
                    <div key={item.id} className="flex gap-[12px] py-[10px] first:pt-0 last:pb-0">
                      <div className="h-[40px] w-[40px] shrink-0 rounded-[7px] bg-[#f4f4f5]" />
                      <div className="flex-1 min-w-0">
                        <p className="font-prompt text-[13px] font-medium text-[#1a1a1a] truncate">
                          {item.product.name}
                        </p>
                        <p className="font-prompt text-[12px] text-[#9a9aa0]">
                          {item.quantity} × ฿{item.product.price.toLocaleString('th-TH')}
                        </p>
                      </div>
                      <p className="font-plex-mono text-[13px] font-medium text-[#1a1a1a] shrink-0 whitespace-nowrap">
                        ฿{(item.product.price * item.quantity).toLocaleString('th-TH')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-prompt text-[12px] text-[#9a9aa0] text-center py-[20px]">
                  ตะกร้าว่าง
                </p>
              )}
            </div>

            {/* Order Summary Panel */}
            {currentCartItems.length > 0 && (
              <div className="rounded-[12px] border border-[#ebebed] bg-white p-[20px] space-y-[14px]">
                <p className="font-prompt text-[11px] font-medium uppercase tracking-[1.2px] text-[#9a9aa0]">
                  สรุปคำสั่งซื้อ
                </p>

                <div className="flex items-center justify-between">
                  <p className="font-prompt text-[14px] text-[#6b6b70]">ยอดรวมสินค้า</p>
                  <p className="font-plex-mono text-[13px] font-medium text-[#1a1a1a]">
                    ฿{cartTotal.toLocaleString('th-TH')}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="font-prompt text-[14px] text-[#6b6b70]">ค่าจัดส่ง</p>
                  <p className="font-plex-mono text-[13px] font-medium text-[#1a1a1a]">฿50</p>
                </div>

                <div className="h-px bg-[#ebebed]" />

                <div className="flex items-center justify-between">
                  <p className="font-prompt text-[14px] font-medium text-[#1a1a1a]">ยอดชำระทั้งสิ้น</p>
                  <p className="font-plex-mono text-[28px] font-semibold text-[#1a1a1a] tracking-[-0.4px]">
                    ฿{(cartTotal + 50).toLocaleString('th-TH')}
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="flex h-[48px] items-center justify-center rounded-[10px] bg-[#1a1a1a] font-prompt text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  ดำเนินการชำระเงิน
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
