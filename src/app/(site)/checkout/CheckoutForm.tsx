"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { formatBaht } from "@/lib/demo-data";
import { createOrderAction, type OrderActionState } from "@/lib/actions/orders";
import type { Address } from "@/lib/data/addresses";
import type { CartLineItem } from "@/lib/data/cart";

// Omise.js (สคริปต์ของ Opn Payments) สร้าง token จากเลขบัตรฝั่งเบราว์เซอร์โดยตรง
// เลขบัตรจริงจึงไม่มีวันถูกส่งเข้าเซิร์ฟเวอร์ของเรา (ข้อกำหนด PCI) — เซิร์ฟเวอร์เห็นแค่ token
type OmiseTokenResponse =
  | { object: "token"; id: string }
  | { object: "error"; code: string; message: string };

declare global {
  interface Window {
    Omise?: {
      setPublicKey: (key: string) => void;
      createToken: (
        type: "card",
        card: {
          name: string;
          number: string;
          expiration_month: number;
          expiration_year: number;
          security_code: string;
        },
        callback: (statusCode: number, response: OmiseTokenResponse) => void,
      ) => void;
    };
  }
}

const paymentMethods = [
  { id: "promptpay", label: "พร้อมเพย์ / PromptPay QR" },
  { id: "credit_card", label: "บัตรเครดิต / เดบิต" },
  { id: "cod", label: "ชำระเงินปลายทาง" },
];

const initialState: OrderActionState = null;

export default function CheckoutForm({
  addresses,
  cartItems,
}: {
  addresses: Address[];
  cartItems: CartLineItem[];
}) {
  const [addressId, setAddressId] = useState<number | null>(
    addresses.find((addr) => addr.isDefault)?.id ?? addresses[0]?.id ?? null,
  );
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0].id);
  const [state, formAction, pending] = useActionState(createOrderAction, initialState);

  // บัตรเครดิต/เดบิต: เชื่อมจริงผ่าน Omise.js — กด "ยืนยันคำสั่งซื้อ" ครั้งแรกจะสร้าง token จากข้อมูลบัตร
  // ก่อน (ยังไม่ submit ฟอร์มจริง) พอได้ token แล้วค่อย submit ฟอร์มอีกทีพร้อม token แนบไปด้วย
  const formRef = useRef<HTMLFormElement>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardToken, setCardToken] = useState<string | null>(null);
  const [tokenizing, setTokenizing] = useState(false);

  const isCardValid =
    cardNumber.length >= 12 && cardName.trim().length > 0 && /^\d{2}\/\d{2}$/.test(cardExpiry) && cardCvv.length >= 3;

  useEffect(() => {
    if (cardToken) {
      formRef.current?.requestSubmit();
    }
  }, [cardToken]);

  function resetCardToken() {
    if (cardToken) setCardToken(null);
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal < 990 ? 50 : 0;
  const total = subtotal + shipping;

  return (
    <>
      <Script
        src="https://cdn.omise.co/omise.js"
        strategy="afterInteractive"
        onLoad={() => {
          const publicKey = process.env.NEXT_PUBLIC_OPN_PUBLIC_KEY;
          if (publicKey) window.Omise?.setPublicKey(publicKey);
        }}
      />
      <form ref={formRef} action={formAction} className="flex flex-col gap-8 lg:flex-row">
        <input type="hidden" name="cardToken" value={cardToken ?? ""} />
        <div className="flex-1 space-y-8">
          <section className="space-y-4">
            <h2 className="text-base font-bold">1. ที่อยู่จัดส่ง</h2>
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
                  ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้ กด &quot;+ จัดการที่อยู่จัดส่ง&quot; ด้านล่างเพื่อเพิ่มที่อยู่แรกของคุณ
                </p>
              ) : (
                addresses.map((addr) => {
                  const detail = [
                    addr.addressLine,
                    addr.subdistrict,
                    addr.district,
                    addr.province,
                    addr.postalCode,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        addressId === addr.id ? "border-ink" : "border-border hover:bg-surface"
                      }`}
                    >
                      <input
                        type="radio"
                        name="addressId"
                        value={addr.id}
                        className="mt-1"
                        checked={addressId === addr.id}
                        onChange={() => setAddressId(addr.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          {addr.label || "ที่อยู่"}
                          {addr.isDefault && " · ค่าเริ่มต้น"}
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          {addr.recipientName} · {addr.phone}
                        </span>
                        {detail && <span className="mt-0.5 block text-sm text-muted">{detail}</span>}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
            <Link
              href="/account/addresses"
              className="inline-block rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
            >
              + จัดการที่อยู่จัดส่ง
            </Link>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-bold">2. วิธีการชำระเงิน</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <div
                    key={method.id}
                    className={`overflow-hidden rounded-xl border transition-colors ${
                      isSelected ? "border-ink" : "border-border hover:bg-surface"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3 p-4">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={() => {
                          setPaymentMethod(method.id);
                          setCardError(null);
                          resetCardToken();
                        }}
                      />
                      <span className="text-sm font-medium">{method.label}</span>
                    </label>

                    {method.id === "credit_card" && (
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isSelected ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="space-y-3 border-t border-border p-4">
                            <p className="text-xs text-muted">
                              เชื่อมกับ Opn Payments จริงแล้ว (โหมดทดสอบ) — เลขบัตรจะถูกแปลงเป็น token
                              ที่เบราว์เซอร์ก่อนส่ง ไม่ผ่านเซิร์ฟเวอร์ของเราโดยตรง
                            </p>
                            <label className="block text-sm">
                              <span className="mb-1 block text-xs font-medium text-muted">หมายเลขบัตร</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={19}
                                placeholder="4242 4242 4242 4242"
                                value={cardNumber}
                                onChange={(e) => {
                                  resetCardToken();
                                  setCardNumber(e.target.value.replace(/[^0-9]/g, ""));
                                }}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ink"
                              />
                            </label>
                            <label className="block text-sm">
                              <span className="mb-1 block text-xs font-medium text-muted">ชื่อบนบัตร</span>
                              <input
                                type="text"
                                placeholder="POONYAPAT PANKASEM"
                                value={cardName}
                                onChange={(e) => {
                                  resetCardToken();
                                  setCardName(e.target.value);
                                }}
                                className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ink"
                              />
                            </label>
                            <div className="flex gap-3">
                              <label className="block flex-1 text-sm">
                                <span className="mb-1 block text-xs font-medium text-muted">วันหมดอายุ</span>
                                <input
                                  type="text"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  value={cardExpiry}
                                  onChange={(e) => {
                                    resetCardToken();
                                    setCardExpiry(e.target.value);
                                  }}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ink"
                                />
                              </label>
                              <label className="block flex-1 text-sm">
                                <span className="mb-1 block text-xs font-medium text-muted">CVV</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={4}
                                  placeholder="123"
                                  value={cardCvv}
                                  onChange={(e) => {
                                    resetCardToken();
                                    setCardCvv(e.target.value.replace(/[^0-9]/g, ""));
                                  }}
                                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-ink"
                                />
                              </label>
                            </div>
                            {cardError && (
                              <p className="text-xs text-[color:var(--color-status-cancelled)]">{cardError}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted">
              * พร้อมเพย์และบัตรเครดิต/เดบิตเชื่อมกับ Opn Payments จริงแล้ว (โหมดทดสอบ ไม่มีการตัดเงินจริง)
              — ชำระเงินปลายทางยังเป็นโหมดจำลอง
            </p>
          </section>
        </div>

        <aside className="h-fit w-full space-y-4 rounded-xl border border-border p-5 lg:w-80">
          <h2 className="text-sm font-bold">สรุปคำสั่งซื้อ</h2>
          <div className="space-y-2 text-sm">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-muted">
                <span className="line-clamp-1 pr-2">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="shrink-0">{formatBaht(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-border pt-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>ยอดรวมสินค้า</span>
              <span>{formatBaht(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>ค่าจัดส่ง</span>
              <span>{shipping === 0 ? "ฟรี" : formatBaht(shipping)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>ยอดรวมทั้งหมด</span>
            <span>{formatBaht(total)}</span>
          </div>
          {state?.error && (
            <p className="text-xs text-[color:var(--color-status-cancelled)]">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending || tokenizing || !addressId}
            title={!addressId ? "กรุณาเพิ่มและเลือกที่อยู่จัดส่งก่อน" : undefined}
            onClick={(e) => {
              // พร้อมเพย์/ชำระเงินปลายทาง: ส่งฟอร์มตามปกติ
              if (paymentMethod !== "credit_card") return;
              // บัตร: ถ้ามี token พร้อมแล้ว (จากการกดครั้งก่อน) ให้ส่งฟอร์มจริงได้เลย
              if (cardToken) return;

              e.preventDefault();
              if (!isCardValid) {
                setCardError("กรุณากรอกข้อมูลบัตรให้ครบและถูกต้อง");
                return;
              }
              const publicKey = process.env.NEXT_PUBLIC_OPN_PUBLIC_KEY;
              if (!window.Omise || !publicKey) {
                setCardError("ไม่สามารถโหลดระบบชำระเงินได้ กรุณาลองใหม่อีกครั้ง");
                return;
              }
              window.Omise.setPublicKey(publicKey);

              setCardError(null);
              setTokenizing(true);
              const [expMonthRaw, expYearRaw] = cardExpiry.split("/");
              window.Omise.createToken(
                "card",
                {
                  name: cardName,
                  number: cardNumber,
                  expiration_month: Number(expMonthRaw),
                  expiration_year: 2000 + Number(expYearRaw),
                  security_code: cardCvv,
                },
                (_statusCode, response) => {
                  setTokenizing(false);
                  if (response.object === "error") {
                    setCardError(response.message);
                    return;
                  }
                  setCardToken(response.id);
                },
              );
            }}
            className="block w-full rounded-lg bg-primary py-3 text-center text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tokenizing
              ? "กำลังตรวจสอบบัตร..."
              : pending
                ? "กำลังยืนยันคำสั่งซื้อ..."
                : "ยืนยันคำสั่งซื้อ"}
          </button>
        </aside>
      </form>
    </>
  );
}
