-- เพิ่มฟีเจอร์อัปโหลดรูปโปรไฟล์ — รันไฟล์นี้ใน Supabase Dashboard > SQL Editor ครั้งเดียว
-- (Claude เชื่อมต่อ Supabase MCP ไม่ได้ตอนนี้ — session/OAuth หมดอายุ ต้องรันเองผ่าน Dashboard)

-- 1) เพิ่มคอลัมน์เก็บ URL รูปโปรไฟล์
alter table public.users add column if not exists avatar_url text;

-- 2) สร้าง Storage bucket ชื่อ "avatars" (public อ่านได้ทุกคน เพราะรูปโปรไฟล์ไม่ใช่ข้อมูลลับ)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3) เปิด RLS ของ storage.objects (ปกติเปิดอยู่แล้วโดยดีฟอลต์ของ Supabase แต่กันไว้)
alter table storage.objects enable row level security;

-- 4) Policy: ทุกคนอ่านรูปใน bucket avatars ได้ (จำเป็นเพื่อโชว์รูปในหน้าเว็บ)
drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- 5) Policy: อัปโหลด/แก้ไข/ลบได้เฉพาะไฟล์ในโฟลเดอร์ของตัวเอง (path ต้องขึ้นต้นด้วย user id
--    ของตัวเอง เช่น "<user_id>/avatar.jpg" — ตรงกับที่โค้ด uploadAvatarAction ใช้)
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
