"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ฟังการเปลี่ยนแปลงตาราง orders/payments แบบ real-time ผ่าน Supabase Realtime — พอลูกค้าชำระเงิน
// (หรือมีออเดอร์ใหม่/เปลี่ยนสถานะ) หน้าแอดมินที่เปิดค้างอยู่จะ refresh ข้อมูลจากเซิร์ฟเวอร์เองทันที
// ไม่ต้องกดรีเฟรชหน้าเอง สิทธิ์การรับ event คุมด้วย RLS (orders_admin_select / payments_admin_select)
export default function AdminRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;

    // การชำระเงินครั้งเดียวอัปเดตทั้ง payments และ orders ติดกัน — รวบเป็น refresh ครั้งเดียว
    const scheduleRefresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 400);
    };

    const channel = supabase
      .channel("admin-orders-payments")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, scheduleRefresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "payments" }, scheduleRefresh)
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
