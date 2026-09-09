-- ตัดสต็อกสินค้าจริงตอนสั่งซื้อ — Postgres function (SECURITY DEFINER) เพราะ RLS ของ
-- products ให้ authenticated อ่านได้อย่างเดียว เขียนไม่ได้ (ตั้งใจกันผู้ใช้แก้ราคา/สต็อกเอง)

create or replace function public.decrement_order_stock(p_order_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  updated_rows int;
begin
  -- เช็คก่อนว่า order นี้เป็นของผู้ใช้ที่เรียกจริง (SECURITY DEFINER ข้าม RLS ไปหมด
  -- ต้องเช็คสิทธิ์เองในฟังก์ชัน กันคนอื่นเรียกตัด stock ของ order ที่ไม่ใช่ของตัวเอง)
  if not exists (
    select 1 from public.orders o
    where o.id = p_order_id and o.user_id = auth.uid()
  ) then
    raise exception 'ไม่พบคำสั่งซื้อ หรือไม่มีสิทธิ์เข้าถึง';
  end if;

  for r in
    select oi.product_id, oi.quantity
    from public.order_items oi
    where oi.order_id = p_order_id
  loop
    -- UPDATE แบบมีเงื่อนไข stock_quantity >= quantity ในประโยคเดียวกัน กันสต็อกติดลบ
    -- ถ้ามีคนสั่งพร้อมกันสองคนพร้อมกัน (race condition) — แถวไหนอัปเดตไม่ติดถือว่าสต็อกไม่พอ
    update public.products
    set stock_quantity = stock_quantity - r.quantity
    where id = r.product_id and stock_quantity >= r.quantity;

    get diagnostics updated_rows = row_count;
    if updated_rows = 0 then
      raise exception 'สินค้าไม่พอ (product_id: %)', r.product_id;
    end if;
  end loop;
end;
$$;

-- จำกัดสิทธิ์เรียกฟังก์ชันนี้เฉพาะ authenticated เท่านั้น (ตาม security advisor pattern เดียวกับ
-- handle_new_auth_user ที่ทำไปแล้วตอน auth) — ป้องกัน anon เรียกได้แม้ยังไม่ล็อกอิน
revoke all on function public.decrement_order_stock(bigint) from public;
grant execute on function public.decrement_order_stock(bigint) to authenticated;
