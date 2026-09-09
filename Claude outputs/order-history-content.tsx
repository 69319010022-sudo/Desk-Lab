'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
  };
}

interface Order {
  id: string;
  orderNumber: number;
  date: string;
  items: string;
  status: 'pending' | 'processing' | 'paid' | 'cancelled';
  total: number;
  cancellationReason?: string;
  canCancel?: boolean;
  canReorder?: boolean;
}

interface OrderHistoryContentProps {
  user: User;
}

const SAMPLE_ORDERS: Order[] = [
  {
    id: 'order-11',
    orderNumber: 11,
    date: '5 ก.ย. 2569',
    items: 'โคมไฟตั้งโต๊ะ LED ปรับแสง รุ่น DL-500',
    status: 'processing',
    total: 590,
    canCancel: false,
    canReorder: false,
  },
  {
    id: 'order-10',
    orderNumber: 10,
    date: '3 ก.ย. 2569',
    items: 'แผ่นรองเมาส์ผ้า XL กันลื่น และอีก 2 รายการ',
    status: 'paid',
    total: 2270,
    canCancel: false,
    canReorder: false,
  },
  {
    id: 'order-9',
    orderNumber: 9,
    date: '2 ก.ย. 2569',
    items: 'ที่วางหูฟังไม้ธรรมชาติ',
    status: 'processing',
    total: 450,
    canCancel: false,
    canReorder: false,
  },
  {
    id: 'order-8',
    orderNumber: 8,
    date: '2 ก.ย. 2569',
    items: 'ที่วางจอปรับระดับ Aluminum',
    status: 'paid',
    total: 1290,
    canCancel: false,
    canReorder: false,
  },
  {
    id: 'order-7',
    orderNumber: 7,
    date: '2 ก.ย. 2569',
    items: 'แผ่นรองเมาส์ผ้า XL กันลื่น',
    status: 'pending',
    total: 390,
    canCancel: true,
    canReorder: false,
  },
  {
    id: 'order-6',
    orderNumber: 6,
    date: '2 ก.ย. 2569',
    items: 'โคมไฟตั้งโต๊ะ LED ปรับแสง รุ่น DL-500',
    status: 'cancelled',
    total: 590,
    cancellationReason: 'เหตุผล: ต้องการเปลี่ยนสินค้า (สี/ขนาด/จำนวน)',
    canCancel: false,
    canReorder: true,
  },
  {
    id: 'order-5',
    orderNumber: 5,
    date: '2 ก.ย. 2569',
    items: 'ที่ชาร์จไร้สาย 15W และอีก 1 รายการ',
    status: 'pending',
    total: 980,
    canCancel: true,
    canReorder: false,
  },
  {
    id: 'order-4',
    orderNumber: 4,
    date: '1 ก.ย. 2569',
    items: 'โคมไฟตั้งโต๊ะ LED ปรับแสง รุ่น DL-500',
    status: 'pending',
    total: 1180,
    canCancel: true,
    canReorder: false,
  },
  {
    id: 'order-3',
    orderNumber: 3,
    date: '1 ก.ย. 2569',
    items: 'โคมไฟตั้งโต๊ะ LED ปรับแสง รุ่น DL-500',
    status: 'cancelled',
    total: 1180,
    cancellationReason: 'เหตุผล: เปลี่ยนใจ ไม่ต้องการสินค้าแล้ว',
    canCancel: false,
    canReorder: true,
  },
  {
    id: 'order-2',
    orderNumber: 2,
    date: '31 ส.ค. 2569',
    items: 'โคมไฟตั้งโต๊ะ LED ปรับแสง รุ่น DL-500',
    status: 'cancelled',
    total: 590,
    canCancel: false,
    canReorder: true,
  },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอชำระเงิน',
  processing: 'รอจัดส่ง',
  paid: 'ชำระเงินแล้ว',
  cancelled: 'ยกเลิกแล้ว',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-[#fef3c7]', text: 'text-[#b45309]' },
  processing: { bg: 'bg-[#ede9fe]', text: 'text-[#7c3aed]' },
  paid: { bg: 'bg-[#dbeafe]', text: 'text-[#1d4ed8]' },
  cancelled: { bg: 'bg-[#fee2e2]', text: 'text-[#b91c1c]' },
};

export function OrderHistoryContent({ user }: OrderHistoryContentProps) {
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredOrders = filterStatus
    ? SAMPLE_ORDERS.filter((order) => order.status === filterStatus)
    : SAMPLE_ORDERS;

  const stats = {
    total: SAMPLE_ORDERS.length,
    totalSpent: SAMPLE_ORDERS.reduce((sum, order) => sum + order.total, 0),
    cancelled: SAMPLE_ORDERS.filter((order) => order.status === 'cancelled').length,
  };

  const handleCancel = useCallback((orderId: string) => {
    // TODO: Implement cancel order action
    console.log('Cancel order:', orderId);
  }, []);

  const handleReorder = useCallback((orderId: string) => {
    // TODO: Implement reorder action
    console.log('Reorder:', orderId);
  }, []);

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Left Rail - Navigation */}
      <nav className="w-[76px] bg-[var(--bg-inverse)] text-white flex flex-col items-center py-6 gap-8">
        {/* Logo */}
        <div className="flex items-center justify-center w-10 h-10 rounded-[11px] bg-white">
          <span className="text-[13px] font-medium text-[var(--bg-inverse)]">DL</span>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-1">
          <Link
            href="/shop"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="หน้าแรก"
          >
            <div className="text-[18px] opacity-50">🏠</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">หน้าแรก</span>
          </Link>
          <Link
            href="/shop"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="สินค้า"
          >
            <div className="text-[18px] opacity-50">🛍️</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">สินค้า</span>
          </Link>
          <Link
            href="/cart"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="ตะกร้า"
          >
            <div className="text-[18px] opacity-50">🛒</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">ตะกร้า</span>
          </Link>
          <Link
            href="/orders"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg hover:bg-[var(--bg-surface)] transition flex-col gap-1"
            title="คำสั่งซื้อ"
          >
            <div className="text-[18px] opacity-50">📋</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white/50">คำสั่งซื้อ</span>
          </Link>
        </div>

        {/* Account - Bottom (active) */}
        <div className="mt-auto">
          <Link
            href="/profile"
            className="flex items-center justify-center w-[60px] h-[58px] rounded-lg bg-white/10 flex-col gap-1"
          >
            <div className="text-[18px]">👤</div>
            <span className="text-[10px] font-medium uppercase tracking-widest text-white">บัญชี</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-[68px] bg-white border-b border-[var(--border-subtle)] flex items-center justify-between px-7 gap-5">
          <div>
            <h1 className="text-[20px] font-medium text-[var(--text-ink)]">ประวัติการสั่งซื้อ</h1>
            <p className="text-[12px] text-[var(--text-faint)] mt-0.5">DeskLab · ตรวจสอบสถานะคำสั่งซื้อ</p>
          </div>
          <input
            type="text"
            placeholder="ค้นหาสินค้า ชื่อ หรือรหัส SKU"
            className="flex-1 max-w-md h-[42px] px-[14px] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[10px] text-[14px] placeholder-[var(--text-faint)] focus:outline-none focus:border-[var(--text-ink)] transition"
          />
          <div className="h-[42px] bg-[var(--bg-inverse)] text-white px-4 rounded-[10px] flex items-center gap-3 shrink-0 w-[180px]">
            <span className="text-[13px] font-medium">ตะกร้า 0</span>
            <div className="w-px h-[18px] bg-white/25" />
            <span className="text-[13px] font-medium font-mono">฿0</span>
          </div>
          <div className="w-[38px] h-[38px] rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center shrink-0">
            <span className="text-[12px] text-[var(--text-muted)]">{getInitials(user.email)}</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 gap-6 flex">
          {/* Orders List */}
          <div className="flex-1 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-[24px] font-semibold text-[var(--text-ink)] mb-2 tracking-[-0.2px]">
                ประวัติการสั่งซื้อ
              </h2>
              <p className="text-[14px] text-[var(--text-muted)] mb-6">
                ทั้งหมด {filteredOrders.length} รายการ
              </p>

              {/* Filter Chips */}
              <div className="flex gap-2 flex-wrap mb-8">
                <button
                  onClick={() => setFilterStatus(null)}
                  className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition ${
                    filterStatus === null
                      ? 'bg-[var(--bg-inverse)] text-white'
                      : 'bg-white border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition ${
                    filterStatus === 'pending'
                      ? 'bg-[var(--bg-inverse)] text-white'
                      : 'bg-white border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  รอชำระเงิน
                </button>
                <button
                  onClick={() => setFilterStatus('processing')}
                  className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition ${
                    filterStatus === 'processing'
                      ? 'bg-[var(--bg-inverse)] text-white'
                      : 'bg-white border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  รอจัดส่ง
                </button>
                <button
                  onClick={() => setFilterStatus('paid')}
                  className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition ${
                    filterStatus === 'paid'
                      ? 'bg-[var(--bg-inverse)] text-white'
                      : 'bg-white border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  ชำระเงินแล้ว
                </button>
                <button
                  onClick={() => setFilterStatus('cancelled')}
                  className={`h-[36px] px-4 rounded-full text-[13px] font-medium transition ${
                    filterStatus === 'cancelled'
                      ? 'bg-[var(--bg-inverse)] text-white'
                      : 'bg-white border border-[var(--border-default)] text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  ยกเลิกแล้ว
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="border-b border-[var(--border-subtle)] mb-6" />

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-6"
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-[16px] font-medium text-[var(--text-ink)] mb-1">
                        คำสั่งซื้อ #{order.orderNumber}
                      </h3>
                      <p className="text-[12px] text-[var(--text-muted)] mb-4">{order.date}</p>

                      <p className="text-[14px] text-[var(--text-muted)] mb-3">{order.items}</p>

                      {order.cancellationReason && (
                        <p className="text-[12px] text-[#b91c1c] mb-3">{order.cancellationReason}</p>
                      )}

                      <div className="flex items-center gap-4">
                        <div
                          className={`h-[26px] px-[10px] rounded-[6px] flex items-center justify-center ${
                            STATUS_COLORS[order.status].bg
                          }`}
                        >
                          <span
                            className={`text-[13px] font-medium ${STATUS_COLORS[order.status].text}`}
                          >
                            {STATUS_LABELS[order.status]}
                          </span>
                        </div>

                        {order.canCancel && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="text-[13px] font-medium text-[#b91c1c] hover:opacity-80 transition"
                          >
                            ยกเลิก
                          </button>
                        )}

                        {order.canReorder && (
                          <button
                            onClick={() => handleReorder(order.id)}
                            className="text-[13px] font-medium text-[var(--text-ink)] hover:opacity-80 transition"
                          >
                            สั่งอีกครั้ง
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[16px] font-mono font-medium text-[var(--text-ink)]">
                        ฿{order.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[14px] text-[var(--text-muted)]">ไม่มีคำสั่งซื้อ</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Account Summary */}
          <div className="w-[340px] shrink-0">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-5">
              <h3 className="text-[14px] font-medium text-[var(--text-ink)] mb-6">สรุปบัญชี</h3>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-[var(--text-muted)]">คำสั่งซื้อทั้งหมด</p>
                  <p className="text-[16px] font-mono font-medium text-[var(--text-ink)]">
                    {stats.total} รายการ
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-[var(--text-muted)]">ยอดใช้จ่ายสะสม</p>
                  <p className="text-[16px] font-mono font-medium text-[var(--text-ink)]">
                    ฿{stats.totalSpent.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[14px] text-[var(--text-muted)]">คำสั่งซื้อที่ยกเลิก</p>
                  <p className="text-[16px] font-mono font-medium text-[var(--text-ink)]">
                    {stats.cancelled} รายการ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
