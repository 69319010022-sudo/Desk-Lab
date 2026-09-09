'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
}

interface Address {
  id: string;
  type: 'home' | 'work';
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

interface CheckoutContentProps {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  shippingCost: number;
  grandTotal: number;
  addresses: Address[];
  userEmail: string;
}

export function CheckoutContent({
  cartItems,
  cartCount,
  cartTotal,
  shippingCost,
  grandTotal,
  addresses,
  userEmail,
}: CheckoutContentProps) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ''
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('promptpay');
  const [isConfirming, setIsConfirming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleConfirmOrder = useCallback(async () => {
    setIsConfirming(true);
    try {
      // TODO: Call server action to create order
      // const result = await createOrderAction({
      //   addressId: selectedAddressId,
      //   paymentMethod: selectedPaymentMethod,
      //   items: cartItems,
      // });
      // if (result.success) {
      //   router.push(`/order-confirmation/${result.orderId}`);
      // }

      // Temporary: redirect to order history
      router.push('/orders');
    } finally {
      setIsConfirming(false);
    }
  }, [selectedAddressId, selectedPaymentMethod, cartItems, router]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <div className="flex min-h-screen bg-[var(--bg-sunken)]">
      {/* Left Rail - Navigation */}
      <nav className="w-[76px] bg-[var(--bg-inverse)] text-white flex flex-col items-center py-6 gap-8">
        {/* Logo */}
        <div className="text-xl font-bold">DL</div>

        {/* Nav Items */}
        <div className="flex flex-col gap-6">
          <Link
            href="/shop"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[var(--bg-surface)] transition"
            title="หน้าแรก"
          >
            🏠
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[var(--bg-surface)] transition"
            title="ร้านค้า"
          >
            🛍️
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[var(--bg-surface)] transition"
            title="ตะกร้า"
          >
            🛒
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[var(--bg-surface)] transition"
            title="คำสั่ง"
          >
            📋
          </Link>
        </div>

        {/* Account - Bottom */}
        <div className="mt-auto">
          <Link
            href="/profile"
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--border-default)] hover:bg-[var(--border-subtle)] transition"
            title="บัญชี"
          >
            👤
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-[68px] bg-white border-b border-[var(--border-subtle)] flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] font-medium text-[var(--text-ink)]">ชำระเงิน</h1>
            <span className="text-[14px] text-[var(--text-muted)]">ตะกร้า / ชำระเงิน</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Search */}
            <input
              type="text"
              placeholder="ค้นหา..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border border-[var(--border-subtle)] rounded-lg text-[14px] bg-[var(--bg-base)]"
            />

            {/* Cart Badge */}
            <Link href="/cart" className="relative">
              <div className="text-2xl">🛒</div>
              <div className="absolute -top-2 -right-2 bg-[var(--text-ink)] text-white text-[12px] font-bold px-2 py-1 rounded-full">
                {cartCount}
              </div>
            </Link>

            {/* Profile Avatar */}
            <Link href="/profile" className="w-10 h-10 rounded-lg bg-[var(--bg-surface)] flex items-center justify-center">
              👤
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 flex gap-6 p-7">
          {/* Left Section - Address & Payment (940px) */}
          <div className="flex-1 max-w-[940px]">
            {/* Shipping Address Section */}
            <section className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[20px] font-semibold text-[var(--text-ink)]">ที่อยู่จัดส่ง</h2>
                <Link href="/addresses" className="text-[14px] text-[var(--text-ink)] underline hover:opacity-70">
                  จัดการที่อยู่
                </Link>
              </div>

              <div className="flex flex-col gap-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedAddressId === address.id
                        ? 'border-[var(--text-ink)] bg-[var(--bg-base)]'
                        : 'border-[var(--border-default)] bg-white hover:bg-[var(--bg-sunken)]'
                    }`}
                  >
                    {/* Radio Button */}
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      className="mt-1 cursor-pointer"
                    />

                    {/* Address Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-[14px] font-medium text-[var(--text-ink)]">{address.name}</h3>
                        {address.isDefault && (
                          <span className="text-[11px] px-2 py-1 bg-[var(--bg-surface)] text-[var(--text-muted)] rounded">
                            ค่าเริ่มต้น
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-[var(--text-muted)] mb-1">{address.address}</p>
                      <p className="text-[13px] text-[var(--text-muted)] mb-1">
                        {address.city} {address.postalCode}
                      </p>
                      <p className="text-[13px] text-[var(--text-muted)]">โทร: {address.phone}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Add New Address Link */}
              <Link
                href="/addresses/new"
                className="inline-block mt-4 text-[14px] text-[var(--text-ink)] underline hover:opacity-70"
              >
                + เพิ่มที่อยู่ใหม่
              </Link>
            </section>

            {/* Payment Method Section */}
            <section className="bg-white rounded-lg p-6">
              <h2 className="text-[20px] font-semibold text-[var(--text-ink)] mb-6">วิธีชำระเงิน</h2>

              <div className="flex flex-col gap-4">
                {/* PromptPay */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedPaymentMethod === 'promptpay'
                      ? 'border-[var(--text-ink)] bg-[var(--bg-base)]'
                      : 'border-[var(--border-default)] bg-white hover:bg-[var(--bg-sunken)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="promptpay"
                    checked={selectedPaymentMethod === 'promptpay'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="cursor-pointer"
                  />
                  <div>
                    <h3 className="text-[14px] font-medium text-[var(--text-ink)]">PromptPay</h3>
                    <p className="text-[13px] text-[var(--text-muted)]">โอนเงินผ่าน PromptPay 24 ชม.</p>
                  </div>
                </label>

                {/* Credit/Debit Card */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedPaymentMethod === 'card'
                      ? 'border-[var(--text-ink)] bg-[var(--bg-base)]'
                      : 'border-[var(--border-default)] bg-white hover:bg-[var(--bg-sunken)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPaymentMethod === 'card'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="cursor-pointer"
                  />
                  <div>
                    <h3 className="text-[14px] font-medium text-[var(--text-ink)]">บัตรเครดิต/เดบิต</h3>
                    <p className="text-[13px] text-[var(--text-muted)]">Visa, Mastercard, JCB</p>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedPaymentMethod === 'cod'
                      ? 'border-[var(--text-ink)] bg-[var(--bg-base)]'
                      : 'border-[var(--border-default)] bg-white hover:bg-[var(--bg-sunken)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={selectedPaymentMethod === 'cod'}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="cursor-pointer"
                  />
                  <div>
                    <h3 className="text-[14px] font-medium text-[var(--text-ink)]">ชำระเงินปลายทาง</h3>
                    <p className="text-[13px] text-[var(--text-muted)]">ชำระเมื่อรับสินค้า</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* Right Section - Order Summary (340px) */}
          <div className="w-[340px]">
            <div className="bg-white border border-[var(--border-subtle)] rounded-lg p-6 sticky top-24">
              {/* Header */}
              <h3 className="text-[16px] font-semibold text-[var(--text-ink)] mb-4">
                รายการสั่งซื้อ ({cartItems.length})
              </h3>

              {/* Items List */}
              <div className="flex flex-col gap-3 mb-4 pb-4 border-b border-[var(--border-subtle)] max-h-[200px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-[13px] text-[var(--text-ink)] font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-[12px] text-[var(--text-muted)]">จำนวน: {item.quantity}</p>
                    </div>
                    <p className="text-[13px] font-mono text-[var(--text-ink)] whitespace-nowrap ml-2">
                      ฿{(item.product.price * item.quantity).toLocaleString('th-TH')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary Rows */}
              <div className="flex flex-col gap-3">
                {/* Subtotal */}
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-muted)]">ยอดรวม</span>
                  <span className="font-mono text-[var(--text-ink)]">฿{cartTotal.toLocaleString('th-TH')}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-[13px]">
                  <span className="text-[var(--text-muted)]">ค่าจัดส่ง</span>
                  <span className="font-mono text-[var(--text-ink)]">฿{shippingCost.toLocaleString('th-TH')}</span>
                </div>

                {/* Divider */}
                <div className="h-px bg-[var(--border-subtle)]" />

                {/* Grand Total */}
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[var(--text-ink)] font-medium">รวมทั้งสิ้น</span>
                  <span className="font-mono text-[20px] font-semibold text-[var(--text-ink)]">
                    ฿{grandTotal.toLocaleString('th-TH')}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--border-subtle)] my-4" />

              {/* Confirm Button */}
              <button
                onClick={handleConfirmOrder}
                disabled={isConfirming || !selectedAddressId}
                className="w-full bg-[var(--text-ink)] text-white rounded-lg py-3 text-[14px] font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isConfirming ? '⏳ กำลังยืนยัน...' : 'ยืนยันคำสั่งซื้อ'}
              </button>

              {/* Confirmation Text */}
              <p className="text-[12px] text-[var(--text-muted)] text-center mt-3">
                โปรดยืนยันที่อยู่จัดส่งและวิธีชำระเงินก่อนดำเนินการ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
