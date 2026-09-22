-- เปิด Supabase Realtime ให้ตาราง orders และ payments เพื่อให้หน้าแอดมินรับ event ตอนลูกค้าชำระเงิน
-- แล้ว refresh ข้อมูลเองทันที (ดู src/components/admin/AdminRealtimeRefresh.tsx)
-- สิทธิ์ว่าใครได้รับ event ไหนยังคุมด้วย RLS เดิม (orders_admin_select / payments_admin_select)
alter publication supabase_realtime add table public.orders, public.payments;
