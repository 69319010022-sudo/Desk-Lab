'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  updateCartItemQuantityAction,
  removeFromCartAction,
  clearCartAction,
} from '@/lib/actions/cart';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    images?: string[];
  };
}

interface CartContentProps {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  shippingCost: number;
  grandTotal: number;
}

export function CartContent({
  cartItems: initialItems,
  cartCount: initialCount,
  cartTotal: initialTotal,
  shippingCost,
  grandTotal: initialGrandTotal,
}: CartContentProps) {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(initialItems);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate totals from current state
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const grandTotal = cartTotal + shippingCost;

  const handleUpdateQuantity = useCallback(
    async (itemId: string, newQuantity: number) => {
      if (newQuantity < 1) return;

      setIsUpdating(itemId);
      try {
        const result = await updateCartItemQuantityAction(itemId, newQuantity);
        if (result.success) {
          // Update local state
          setCartItems((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
          );
        } else {
          console.error('Failed to update quantity:', result.error);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      } finally {
        setIsUpdating(null);
      }
    },
    []
  );

  const handleRemoveItem = useCallback(async (itemId: string) => {
    setIsUpdating(itemId);
    try {
      const result = await removeFromCartAction(itemId);
      if (result.success) {
        // Remove item from local state
        setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      } else {
        console.error('Failed to remove item:', result.error);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(null);
    }
  }, []);

  const handleClearCart = useCallback(async () => {
    if (!confirm('คุณแน่ใจว่าต้องการล้างตะกร้า?')) return;

    setIsClearing(true);
    try {
      const result = await clearCartAction();
      if (result.success) {
        setCartItems([]);
      } else {
        console.error('Failed to clear cart:', result.error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsClearing(false);
    }
  }, []);

  const isEmpty = cartItems.length === 0;

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
          { icon: '🛒', label: 'ตะกร้า', href: '/cart', active: true },
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
            <h1 className="font-prompt text-[20px] font-medium text-[#1a1a1a]">ตะกร้าสินค้า</h1>
            <p className="font-prompt text-[12px] text-[#9a9aa0]">DeskLab · ตรวจสอบก่อนชำระเงิน</p>
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
        <div className="flex flex-1 gap-[24px] overflow-hidden px-[28px] py-[24px]">
          {/* Left: Cart Items */}
          <div className="flex-1 flex flex-col gap-[16px] overflow-y-auto min-w-0 w-[940px]">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-[16px]">
                <p className="font-prompt text-[20px] font-medium text-[#1a1a1a]">ตะกร้าว่าง</p>
                <p className="font-prompt text-[14px] text-[#6b6b70]">เลือกสินค้าจากร้านเพื่อเพิ่มเข้าตะกร้า</p>
                <Link
                  href="/shop"
                  className="mt-[16px] px-[20px] py-[10px] rounded-[10px] bg-[#1a1a1a] font-prompt text-[14px] font-medium text-white hover:opacity-90 transition-opacity"
                >
                  ← เลือกซื้อสินค้าต่อ
                </Link>
              </div>
            ) : (
              <>
                {/* Cart Header */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-[8px]">
                    <h2 className="font-prompt text-[24px] font-semibold text-[#1a1a1a] tracking-[-0.2px]">
                      ตะกร้าสินค้า
                    </h2>
                    <p className="font-prompt text-[14px] text-[#6b6b70]">
                      รวมสินค้า {cartCount} ชิ้น จาก {cartItems.length} รายการ
                    </p>
                  </div>
                  <button
                    onClick={handleClearCart}
                    disabled={isClearing}
                    className="font-prompt text-[13px] font-medium text-[#6b6b70] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
                  >
                    {isClearing ? '⏳ ล้างตะกร้า...' : 'ล้างตะกร้า'}
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#ebebed]" />

                {/* Cart Items */}
                <div className="space-y-0 divide-y divide-[#ebebed]">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="py-[16px] first:pt-0 last:pb-0 flex gap-[16px] items-start"
                    >
                      {/* Product Image */}
                      <div className="w-[64px] h-[64px] shrink-0 rounded-[10px] bg-[#fafafa] border border-[#ebebed] flex items-center justify-center overflow-hidden">
                        {item.product.images && item.product.images[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-[#9a9aa0]">📷</div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-[4px]">
                          <h3 className="font-prompt text-[16px] font-medium text-[#1a1a1a] line-clamp-1">
                            {item.product.name}
                          </h3>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isUpdating === item.id}
                            className="font-prompt text-[13px] font-medium text-[#6b6b70] hover:text-[#1a1a1a] transition-colors disabled:opacity-50 whitespace-nowrap ml-[12px]"
                          >
                            {isUpdating === item.id ? '⏳' : 'ลบ'}
                          </button>
                        </div>
                        <p className="font-prompt text-[13px] text-[#6b6b70] mb-[12px]">
                          SKU · {item.productId}
                        </p>

                        {/* Quantity and Price Row */}
                        <div className="flex items-center justify-between">
                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-[#d9d9dc] rounded-[8px] h-[36px]">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                              }
                              disabled={isUpdating === item.id}
                              className="w-[36px] h-[36px] flex items-center justify-center text-[14px] font-medium text-[#6b6b70] hover:bg-[#f4f4f5] disabled:opacity-50"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                handleUpdateQuantity(item.id, Math.max(1, val));
                              }}
                              className="w-[40px] h-[36px] text-center font-plex-mono text-[16px] font-medium border-0 outline-none bg-transparent"
                            />
                            <button
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={isUpdating === item.id}
                              className="w-[36px] h-[36px] flex items-center justify-center text-[14px] font-medium text-[#1a1a1a] hover:bg-[#f4f4f5] disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          {/* Unit Price */}
                          <div className="text-right">
                            <p className="font-plex-mono text-[13px] text-[#6b6b70] mb-[2px]">
                              ฿{item.product.price.toLocaleString('th-TH')} / ชิ้น
                            </p>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right min-w-[120px]">
                            <p className="font-plex-mono text-[20px] font-semibold text-[#1a1a1a] tracking-[-0.2px]">
                              ฿{(item.product.price * item.quantity).toLocaleString('th-TH')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-[#ebebed]" />

                {/* Continue Shopping Button */}
                <Link
                  href="/shop"
                  className="px-[16px] py-[12px] rounded-[10px] border border-[#d9d9dc] font-prompt text-[14px] font-medium text-[#6b6b70] text-center hover:bg-[#f4f4f5] transition-colors inline-block"
                >
                  ← เลือกซื้อสินค้าต่อ
                </Link>
              </>
            )}
          </div>

          {/* Right: Order Summary */}
          {!isEmpty && (
            <div className="w-[340px] shrink-0 rounded-[12px] border border-[#ebebed] bg-white p-[20px] h-fit space-y-[14px]">
              {/* Header */}
              <p className="font-prompt text-[11px] font-medium uppercase tracking-[1.2px] text-[#9a9aa0]">
                สรุปคำสั่งซื้อ
              </p>

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <p className="font-prompt text-[14px] text-[#6b6b70]">ยอดรวมสินค้า</p>
                <p className="font-plex-mono text-[13px] font-medium text-[#1a1a1a]">
                  ฿{cartTotal.toLocaleString('th-TH')}
                </p>
              </div>

              {/* Shipping */}
              <div className="flex items-center justify-between">
                <p className="font-prompt text-[14px] text-[#6b6b70]">ค่าจัดส่ง</p>
                <p className="font-plex-mono text-[13px] font-medium text-[#1a1a1a]">
                  ฿{shippingCost.toLocaleString('th-TH')}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#ebebed]" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <p className="font-prompt text-[14px] font-medium text-[#1a1a1a]">ยอดชำระทั้งสิ้น</p>
                <p className="font-plex-mono text-[28px] font-semibold text-[#1a1a1a] tracking-[-0.4px]">
                  ฿{grandTotal.toLocaleString('th-TH')}
                </p>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="flex h-[48px] items-center justify-center rounded-[10px] bg-[#1a1a1a] font-prompt text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              >
                ดำเนินการชำระเงิน
              </Link>

              {/* Shipping Info */}
              <p className="font-prompt text-[12px] text-[#6b6b70] text-center pt-[8px]">
                จัดส่งด่วน 1–3 วันทำการ ทั่วประเทศ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
