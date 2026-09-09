# Supabase — สคีมา, ข้อมูลตั้งต้น และ migration

โฟลเดอร์นี้เก็บไฟล์ SQL ของโปรเจกต์ DeskLab (Supabase project: **Desk-Lab**, `wrokdxuxazwzpttghrko`, region `ap-northeast-1`)

## ไฟล์ในโฟลเดอร์นี้

| ไฟล์ | คืออะไร |
|---|---|
| `schema.sql` | สคีมาตั้งต้นทั้ง 11 ตาราง (export จาก dbdiagram.io — ดูรูป ERD ที่ `docs/assets/database-erd.png`) |
| `seed.sql` | ข้อมูลสินค้า/หมวดหมู่ตั้งต้นที่ใช้ตอนเริ่มโปรเจกต์ |
| `migrations/` | สำเนาอ้างอิงของ migration ที่รันไปแล้วบนฐานข้อมูลจริง |

## ⚠️ อ่านก่อนรันอะไรก็ตาม

ไฟล์ในโฟลเดอร์นี้เป็น **สำเนาอ้างอิง (reference copy)** เท่านั้น — migration ทั้งหมด
**ถูก apply เข้าฐานข้อมูลจริงไปแล้ว** ผ่าน Supabase MCP (`apply_migration`) ไม่ได้ใช้ Supabase CLI
**ห้ามรันซ้ำ** โดยไม่ตรวจสอบก่อน เพราะข้อมูลจริงอยู่ในฐานข้อมูลแล้ว

## รายการ migration ที่ apply ไปแล้วจริง (ดึงจากฐานข้อมูล 2026-09-05)

| version | ชื่อ | มีไฟล์ในโฟลเดอร์นี้ไหม |
|---|---|---|
| 20260831132857 | `auto_create_public_user_on_signup` | ❌ ไม่มี |
| 20260831133000 | `restrict_handle_new_auth_user_execute` | ❌ ไม่มี |
| 20260831184235 | `orders_allow_own_pending_cancel` | ❌ ไม่มี |
| 20260831192402 | `orders_add_cancel_reason` | ❌ ไม่มี |
| 20260901191826 | `allow_cod_payment_method` | ❌ ไม่มี |
| 20260902193257 | `add_avatar_column_and_bucket` | ✅ `20260902193257_avatar_storage.sql` |
| 20260902193325 | `add_avatar_storage_policies` | ✅ (รวมอยู่ในไฟล์เดียวกันด้านบน) |
| 20260903152938 | `add_decrement_order_stock_function` | ✅ `20260903152938_decrement_order_stock.sql` |
| 20260903152957 | `revoke_anon_decrement_order_stock` | ✅ (รวมอยู่ในไฟล์เดียวกันด้านบน) |
| 20260905130020 | `enforce_username_format_and_uniqueness` | ❌ ไม่มี |
| 20260905142146 | `add_product_images_new_categories_and_products` | ❌ ไม่มี |

**หมายเหตุ**: migration ที่ไม่มีไฟล์ในเครื่อง ถูกเขียนและรันตรงผ่าน MCP ตอนพัฒนา
ถ้าต้องการดูเนื้อหาจริงของ migration เหล่านั้น ดูได้ที่ Supabase Dashboard > Database > Migrations
หรือดูคำอธิบายว่าแต่ละอันทำอะไรได้ที่ `docs/desklab-plan.md`

## RLS

ทุกตาราง (11 ตาราง) เปิด Row Level Security ไว้แล้ว — รายละเอียด policy ทั้งหมด
อธิบายไว้ที่หัวข้อ "RLS — เปิดใช้งานสำเร็จแล้ว" ใน `docs/desklab-plan.md`
