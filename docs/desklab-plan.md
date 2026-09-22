Desklab Project — แผนงานและการตัดสินใจ

## ⚠️ กติกาการทำงาน (สำคัญ — ทำทุกครั้ง ไม่ข้าม)
ผู้ใช้ขอไว้ (2026-09-05): **ทุกครั้งที่ทำงานส่วนหนึ่งเสร็จ ต้องเช็คไฟล์นี้ (`desklab-plan.md`) ก่อนเสมอ แล้วอัปเดตเขียนไว้ว่าขั้นตอน/งานถัดไปที่ต้องทำคืออะไร** — ห้ามปล่อยให้ไฟล์นี้ตกหล่นล้าสมัย ทุกเซสชันถัดไปต้องอ่านไฟล์นี้ก่อนเริ่มงาน และปิดงานด้วยการอัปเดตส่วน "ขั้นต่อไปที่แนะนำ" ให้ตรงกับสถานะจริงเสมอ

ผู้ใช้ขอเพิ่ม (2026-09-11): **ก่อนเริ่มงานใหม่ทุกครั้ง ต้องเขียนแผนงาน (plan) ลงไฟล์นี้ก่อนเสมอ** แล้วค่อยเริ่มลงมือ — และ **ระหว่างทำงาน ให้ทำทีละขั้นตอน ทำอย่างใดอย่างหนึ่งให้เสร็จก่อนแล้วค่อยไปขั้นต่อไป ห้ามทำรวดเดียวหลายอย่างพร้อมกัน**

## ภาพรวมโปรเจกต์
ร้านขายของแต่งโต๊ะคอมออนไลน์ + โปรแกรมจำลองการจัดโต๊ะในเว็บของร้าน
ทำเป็น 2 เฟสใหญ่: (1) ร้านค้าออนไลน์ก่อน (2) โปรแกรมจำลองการจัดโต๊ะทีหลัง

ผู้ใช้ต้องการเรียนรู้ทีละขั้นตอน (step by step) ไม่ใช่แค่รับโค้ดสำเร็จรูป — ขอให้ทำทีละส่วนย่อย ไม่ทำรวดเดียวทั้งหมด

## การตัดสินใจที่ยืนยันแล้ว
- Frontend/Framework: **Next.js (App Router) + React + TypeScript + Tailwind CSS v4**
- ระบบลูกค้า: **ระบบสมัครสมาชิก/ล็อกอินเต็มรูปแบบ** (ไม่ใช่ guest checkout) — ตะกร้าจึงผูกกับผู้ใช้ที่ล็อกอินเท่านั้น ไม่มีตะกร้าแบบ guest
- **บัญชีผู้ใช้เก็บแค่ "ชื่อผู้ใช้" (username) ไม่เก็บ "ชื่อ-นามสกุล" แยก** (ตัดสินใจ 2026-09-05) — เหตุผล: ชื่อ-นามสกุลจริงของลูกค้ารู้ได้จากที่อยู่จัดส่งอยู่แล้ว ไม่ต้องเก็บซ้ำ ดูรายละเอียดที่หัวข้อ "✅ เปลี่ยนฟิลด์ชื่อผู้ใช้" ด้านล่าง
- Database: **Supabase** (Postgres), project "Desk-Lab" (project_id: wrokdxuxazwzpttghrko, region ap-northeast-1) — **นี่คือ project_id ที่ถูกต้องจริง (ยืนยันจาก .env.local บนเครื่องผู้ใช้) ดูหมายเหตุสำคัญเรื่อง MCP ด้านล่าง**
- Schema: ยืนยันใช้เวอร์ชันใน [[desklab-schema.md]]
- Figma file จริงที่ผู้ใช้ทำ: "Desklap-wireframe" — https://www.figma.com/design/B0bJNlYizSiR0yHWcmOzt3/Desklap-wireframe
- ตารางทั้ง 11 ตารางสร้างสำเร็จแล้วตาม desklab_supabase_schema.sql
- **Supabase Auth: ปิด "Confirm email" ไว้ระหว่างพัฒนา** (ผู้ใช้ตัดสินใจแล้ว) — สมัครสมาชิกแล้วล็อกอินได้ทันที ไม่ต้องยืนยันอีเมล — ต้องกลับมาเปิดใหม่ + ตั้งค่า SMTP ตอนพร้อมเปิดร้านจริง
- **เครื่องมือทดสอบ API: ผู้ใช้เลือก Bruno** (โปรแกรมทดสอบ API แบบเดียวกับ Postman ลงบนเครื่องผู้ใช้เอง) ไว้ใช้ตอนทดสอบ/ตรวจสอบ Supabase REST API ระหว่างพัฒนา — ใช้จริงแล้ว (ดูหัวข้อ Bruno Collection ด้านล่าง)
- **Payment gateway: ยืนยันใช้ Opn Payments (เดิมชื่อ Omise)** โหมดทดสอบ/sandbox — พร้อมเพย์, บัตรเครดิต/เดบิต, และ COD ครบทั้ง 3 วิธีแล้ว ทดสอบผ่านทั้งหมด (ดูหัวข้อ "✅ ข้อ 8: Payment gateway" ด้านล่าง) — **ข้อ 8 เสร็จสมบูรณ์แล้ว**
- **แผน Supabase ปัจจุบันคือ Free plan** (ยืนยันจากหน้า Dashboard เห็นป้าย "FREE" ข้างชื่อองค์กร Poonyapat) — มีผลกับฟีเจอร์บางอย่างที่ล็อกไว้เฉพาะ Pro plan ขึ้นไป (ดูหัวข้อ Leaked Password Protection ด้านล่าง)
- **ระบบ Multi-DB (Primary + 3 Backup/Failover)**: ผู้ใช้ตัดสินใจขยายขอบเขต (2026-09-06) ต้องเชื่อมต่อ **Supabase = ฐานข้อมูลหลัก** และ **SQLite/MySQL/MongoDB = ฐานข้อมูลสำรอง** เพื่อให้ระบบทำงานต่อได้ถ้า Supabase ล่ม (failover pattern) — **ปรับสโคปให้เล็กลงแล้ว (2026-09-13) ดูหัวข้อ "🆕 ระบบ Multi-DB" ด้านล่างสุด — รอบนี้แค่สร้างตารางไว้เฉยๆ ไม่เชื่อม API/sync/failover**

## ✅ RLS — เปิดใช้งานสำเร็จแล้ว
รัน desklab_rls_policies.sql ใน Supabase SQL Editor สำเร็จแล้ว (ผลลัพธ์ "Success. No rows returned")
เปิด Row Level Security ครบทั้ง 11 ตาราง พร้อม policy ตามแนวคิด:
- ตารางแคตตาล็อกสาธารณะ (categories, products [เฉพาะ is_active=true], product_images, reviews) — ให้ anon+authenticated อ่านได้หมด **แต่เขียนไม่ได้เลยแม้จะล็อกอินอยู่** (ไม่มี policy insert/update ให้ authenticated ทั่วไป) เพราะเป็นข้อมูลร้านที่ทุกคนควรเห็นได้แม้ยังไม่ล็อกอิน แต่แก้ราคา/สต็อกเองไม่ได้ (ข้อยกเว้น: reviews มี insert/update/delete ให้เจ้าของรีวิวเองด้วย แต่ยังไม่มีหน้าเขียนรีวิวจริงในแอป)
- ตารางข้อมูลส่วนตัว (users, addresses, carts, cart_items, orders, order_items) — เห็น/แก้ได้เฉพาะแถวของ auth.uid() ตัวเอง; cart_items/order_items ไม่มี user_id ตรงๆ เลยเช็คผ่าน EXISTS subquery ไปที่ carts/orders แม่ของมัน; ตาราง addresses ใช้ policy เดี่ยว `addresses_all_own` (cmd=ALL, qual/with_check = auth.uid() = user_id)
- orders: `orders_insert_own` (insert ออเดอร์ตัวเองได้ตอน checkout), `orders_select_own`, และ `orders_update_own_cancel` (UPDATE ที่จำกัดมาก: อนุญาตเฉพาะเปลี่ยนจากสถานะ **pending** → cancelled ของออเดอร์ตัวเองเท่านั้น — RLS ไม่จำกัดเป็นรายคอลัมน์ แค่จำกัดที่ค่าของแถว จึงอัปเดต cancel_reason พร้อมกันได้) — **ไม่มี policy ให้ authenticated ทั่วไปเปลี่ยนสถานะเป็น paid/processing/shipped/delivered เอง** ตั้งใจไว้แบบนั้น เพื่อบังคับให้การยืนยันชำระเงินสำเร็จต้องผ่าน service role เท่านั้น (ใช้งานจริงแล้ว — ดูหัวข้อ Opn Payments ด้านล่าง) — **ข้อสำคัญ**: เพราะ policy นี้ล็อกไว้เฉพาะ pending→cancelled ออเดอร์ COD ที่เริ่มต้นที่สถานะ "processing" เลย (ดูหัวข้อ COD ด้านล่าง) **ลูกค้าจะกดยกเลิกเองไม่ได้อีกต่อไป** (ปุ่มยกเลิกฝั่ง UI ก็ซ่อนไว้เมื่อไม่ใช่ pending อยู่แล้ว) — เป็นผลข้างเคียงที่ตั้งใจปล่อยไว้ตามที่ผู้ใช้ขอ ยังไม่ได้เพิ่มทางยกเลิกอื่นให้ COD
- order_items: `order_items_select_via_own_order` / `order_items_insert_via_own_order` เช็คผ่าน EXISTS ไปที่ orders แม่ (เจ้าของออเดอร์เท่านั้นเห็น/insert ได้)
- cart_items/carts: `cart_items_all_via_own_cart` (ALL, เช็คผ่าน EXISTS ไปที่ carts แม่), `carts_all_own` (ALL, auth.uid() = user_id)
- products: `products_select_active_public` (แค่ is_active=true อ่านได้ — สำคัญตอนดึง products แบบ nested embed จากตารางอื่น: แถวที่ is_active=false จะได้ null กลับมาจาก RLS ไม่ error)
- payments: `payments_select_via_own_order` — ผู้ใช้ "อ่านได้อย่างเดียว" ของออเดอร์ตัวเอง **ไม่มี policy insert/update ให้ authenticated เลย** (ตั้งใจล็อกไว้กันลูกค้าปลอมสถานะจ่ายเงินเอง) — เขียนได้เฉพาะผ่าน service role client เท่านั้น (ใช้งานจริงแล้วใน `src/lib/actions/orders.ts` และ `src/lib/actions/payments.ts`)
- reviews: อ่านได้ทุกคน เขียน/แก้/ลบได้เฉพาะรีวิวของตัวเอง
- users มี policy insert/select/update ของแถวตัวเองครบ (users_insert_own, users_select_own, users_update_own ใช้ auth.uid() = id) — ไม่มี delete policy ให้ผู้ใช้ทั่วไป
หมายเหตุ: รอบแรกที่รันเจอ error "policy already exists" (รันซ้ำจากที่เคยรันบางส่วนไปแล้ว) แก้โดยเพิ่ม `DROP POLICY IF EXISTS` นำหน้าทุก policy ในไฟล์ ทำให้รันซ้ำได้ปลอดภัย รอบสองรันผ่านสำเร็จ

## ✅ Frontend เชื่อม Supabase จริงแล้ว (แคตตาล็อกสินค้า)
- สร้าง `src/lib/supabase/{client,server,middleware}.ts` ตามแพทเทิร์นทางการของ `@supabase/ssr` (แยก browser client / server client แบบ cookie-based) + `middleware.ts` ที่ root สำหรับ refresh session token ทุก request
- สร้าง `src/lib/data/catalog.ts` — เลเยอร์ดึงข้อมูลจริงจาก Supabase (getCategories, getProducts, getProductBySlug, getRelatedProducts, getReviewsForProduct) คืนค่าเป็น type เดิม (Category/Product/Review) เพื่อไม่ต้องแก้ component เดิม, ทุกฟังก์ชัน graceful-degrade (คืนค่าว่างไม่ throw ถ้าต่อ Supabase ไม่ได้) ยกเว้น error ภายในของ Next.js เอง (DYNAMIC_SERVER_USAGE) ที่ต้อง rethrow ต่อ ห้ามกลืน
- หน้า Home / Shop / Product-detail เปลี่ยนเป็น Server Component แบบ async ดึงข้อมูลจริงแล้ว (ลบ generateStaticParams ของหน้า product ออก เพราะสินค้าต้อง dynamic ตามฐานข้อมูล)
- หมายเหตุ: reviews ยังโชว์ชื่อผู้รีวิวจริงไม่ได้ (RLS ตาราง users อ่านได้เฉพาะแถวตัวเอง) ใช้ป้าย "ลูกค้า DeskLab" ไปก่อน — ของจริงต้องรอระบบเขียนรีวิว (ตอนนี้มี username จริงแล้วหลังเปลี่ยนฟิลด์ชื่อผู้ใช้ — พอมีหน้าเขียนรีวิวจริง ใช้ username แสดงแทนได้เลย ไม่ต้องเพิ่มคอลัมน์ author_name ใหม่)
- แก้บั๊ก path: ตอนแรกไฟล์ Supabase setup ถูกคอมมิตไปผิด path ที่เครื่องผู้ใช้ (เพราะ zip แตกไฟล์แบบแฟลตไม่มีโฟลเดอร์ย่อย) ทำให้ build error เพียบ — แก้แล้วโดยคอมมิตไฟล์ใหม่ไปที่ path ที่ถูกต้อง (`C:\Users\ADMIN\OneDrive\Desktop\Desklab project\`) และให้ผู้ใช้ลบ node_modules + package-lock.json เก่าแล้วติดตั้งใหม่

## ✅ ข้อมูลสินค้าจริง (seed data) — ใส่แล้ว (อัปเดต 2026-09-05: ตอนนี้มีรูปสินค้าจริงแล้วด้วย ดูหัวข้อถัดไป)
เดิม products/categories ในฐานข้อมูลจริงว่างเปล่า (มีแค่โครงตาราง) ทำให้หน้า Shop โชว์สินค้าไม่ขึ้น (ของ demo 8 ชิ้นเป็นแค่ mock ใน demo-data.ts ไม่เคยอยู่ใน Supabase) — แก้แล้วโดยรัน INSERT ใส่ 5 categories + 8 products (ชุดเดียวกับที่เคยเห็นตอน demo) ตรงเข้าไปใน Supabase ผ่าน MCP tool โดยตรง ยืนยันแล้วว่าเว็บโชว์สินค้าขึ้นถูกต้อง

## ✅ รูปสินค้าจริง + จัดหมวดหมู่สินค้าใหม่ + เพิ่มสินค้า 2 ชิ้น (2026-09-05) — เสร็จสมบูรณ์ทั้ง DB + Frontend + build/lint ผ่านแล้ว
ผู้ใช้ขอ (2026-09-05): "ตอนนี้เรื่องของสินค้าผมอยากได้สินค้าจริงๆและน่าเชื่อถือ" — เลือกทำทั้ง 2 อย่าง (แก้ข้อมูลสินค้าให้น่าเชื่อถือ + เพิ่มรูปสินค้าจริง) — เรื่องรูป ผู้ใช้เลือก "Claude วาดภาพประกอบสไตล์ flat/vector ด้วยโค้ด" (ไม่ใช่รูปถ่ายสมจริง)

**ผลลัพธ์สุดท้าย**: 10 สินค้า / 8 หมวดหมู่ ทุกชิ้นมีรูปครบ ราคา/SKU ไม่ซ้ำกัน — รายชื่อสินค้าจริงที่ใช้อ้างอิงต่อได้ (สำหรับ Admin Dashboard):
1. `DL-LED-EYE01` โคมไฟ LED ถนอมสายตา — หมวด โคมไฟ — ฿1,290 — สต็อก 48
2. `DL-STD-ALU08` ขาตั้งแล็ปท็อปอะลูมิเนียม — หมวด ที่วางจอ — ฿1,290 — สต็อก 35
3. `DL-KEY-BT65` คีย์บอร์ดไร้สายบลูทูธ — หมวด คีย์บอร์ด — ฿3,150 — สต็อก 29
4. เบาะรองนั่งเพื่อสุขภาพ (`DL-CUS-ERG02`) — ฿990 — สต็อก 24
5. แผ่นรองเมาส์หนังพรีเมียม (`DL-PAD-LTH03`) — ฿590 — สต็อก 21
6. ที่ชาร์จไร้สาย 15W (`DL-CHG-15W`) — หมวด ที่ชาร์จและปลั๊กไฟ — ฿690 — สต็อกน้อย
7. ปลั๊กพ่วง USB (`DL-PWR-USB4`) — หมวด ที่ชาร์จและปลั๊กไฟ
8. คลิปหนีบสายไฟติดขอบโต๊ะ ชุด 4 (`DL-ORG-CLIP4`) — หมวด ที่จัดระเบียบโต๊ะ — ฿190
9. ถาดจัดระเบียบโต๊ะไม้ยางพารา 3 ช่อง (`DL-ORG-TRAY3`) — หมวด ที่จัดระเบียบโต๊ะ — ฿350 — สต็อกหมด
10. ที่วางหูฟัง (`DL-HLD-HP01`) — หมวด ที่วางหูฟัง

**เก็บไฟล์รูปที่ไหน**: static asset `public/products/*.svg` ของ Next.js (ไม่ใช้ Supabase Storage)

## ✅ Auth จริงผ่าน Supabase Auth — เสร็จแล้ว และผู้ใช้ทดสอบผ่านแล้ว
- Trigger `handle_new_auth_user()` สร้างแถว public.users อัตโนมัติทุกครั้งที่สมัคร
- หน้า `/login`, `/register`, ปุ่มออกจากระบบ, guard ที่ layout, หน้า `/account/profile` ต่อ Supabase Auth จริงแล้ว

## ✅ อัปโหลดรูปโปรไฟล์ / เปลี่ยนฟิลด์ชื่อผู้ใช้ (username) / ตัดสต็อกจริงตอนสั่งซื้อ / ตะกร้า+ที่อยู่+คำสั่งซื้อจริง / ยกเลิก+reorder — เสร็จสมบูรณ์ทั้งหมด ผู้ใช้ทดสอบผ่านแล้ว
(รายละเอียดสถาปัตยกรรมแต่ละอย่างดูใน git history ของไฟล์นี้ — ทุกอย่างเสร็จและ regression-safe แล้ว ไม่ต้องแก้ซ้ำ)

## ✅ ข้อ 8: Payment gateway (Opn Payments) — ครบทั้ง 3 วิธี เสร็จสมบูรณ์แล้ว ผู้ใช้ทดสอบผ่านหมด
พร้อมเพย์ / บัตรเครดิต-เดบิต (Omise.js + 3DS) / COD (เริ่มที่สถานะ "processing" ป้าย "รอจัดส่ง") — ทั้ง 3 วิธีทดสอบผ่านจริงแล้ว

## 🎨 งานออกแบบ UI ใน Figma (หน้าร้านลูกค้า) — POS-style UI ครบทั้ง 9 หน้าแล้ว (2026-09-06) — ผู้ใช้ approve แล้ว
**ไฟล์**: `DeskLab — POS-style UI Design` (fileKey: `UqD5VwG7M7IFPZMoFuoSo2`) — https://www.figma.com/design/UqD5VwG7M7IFPZMoFuoSo2
**หน้าทั้ง 9**: 01·Home, 02·Shop, 03·Product-Detail, 04·Cart, 05·Checkout, 06·Login, 07·Register, 08·Profile, 09·Order-History
Rail ซ้าย 76px, Top bar 68px, ตัวเลข IBM Plex Mono, ข้อความไทย/UI Prompt

## 🆕 ตกแต่ง Frontend ตามดีไซน์ Figma POS-style UI — **ครบทั้ง 9/9 หน้าแล้ว ผู้ใช้ทดสอบจริงผ่านทุกหน้า (2026-09-06/07)**
ทุกหน้ารีสกิน UI เท่านั้น ไม่แตะ server actions/data layer ที่ทดสอบผ่านแล้ว — build/lint ผ่านทุกหน้า — **Task 1 (รีสกินหน้าเว็บลูกค้าตามดีไซน์ POS ทั้ง 9 หน้า) ปิดงานสมบูรณ์ 100%**

**บทเรียนสำคัญที่ใช้ซ้ำได้เสมอ**: ไฟล์ `*-server.tsx`/`*-content.tsx` ที่ได้จาก Figma design-to-code เป็น "โค้ดอ้างอิงเพื่อดูดีไซน์" เท่านั้น **ห้าม copy-paste ตรงๆ** — ต้องอ่านโค้ดจริงในโปรเจกต์ก่อนเสมอว่าหน้านั้นมีฟังก์ชันทำงานอยู่แล้วหรือยัง แล้วรีสกินแค่ส่วน UI/สไตล์

## ✅ Phase 1.5 (Part 1-4: DB tuning + CI/CD + Code Refactor) — เสร็จสมบูรณ์ทั้งหมด (2026-09-08/09)
- `npm run lint` 0 error, `npm run type-check` 0 error, `npm run test` 22/22 ผ่าน, `npm run build` ผ่าน 100%
- GitHub repo: https://github.com/69319010022-sudo/Desk-Lab (Public, branch `main`), GitHub Actions CI 4 jobs (lint/type-check/test/build) เขียวครบ
- Performance advisor: เพิ่ม FK index ครบ + ห่อ `auth.uid()` เป็น `(select auth.uid())` ในทุก RLS policy แล้ว

## ✅ Activity Logging — เสร็จสมบูรณ์แล้ว (2026-09-09)
ครบ 8 ประเภท action: auth.signed_in/signed_up/signed_out/password_changed, order.created/cancelled/reordered, payment.charged/failed, profile.updated/avatar_uploaded/avatar_deleted — `src/lib/actions/logging.ts` (`logActivity()`/`fireAndForgetLog()`) ใช้งานจริงครบทุกจุดแล้ว

## ✅ Bruno Collection — ตรวจสอบ Supabase REST API แบบเต็มรูปแบบ (RLS audit ทุกตาราง) — เสร็จสมบูรณ์ (2026-09-11)
โฟลเดอร์ `bruno/` ที่ root โปรเจกต์ (27 request `.bru` ครบ 11 ตาราง แบ่ง 6 โฟลเดอร์ตามลำดับรัน) — ยืนยัน RLS ถูกต้องทุกจุดด้วย status code จริงจาก Supabase REST/Auth API (ไม่ได้เดา) — Commit `d3fa441` push ขึ้น `main` แล้ว
**ค้างไว้**: ยังไม่ได้ถามผู้ใช้ว่าจะลบข้อมูลทดสอบสังเคราะห์ (บัญชี bruno.testa/testb, ที่อยู่ id=3, order id=15 cancelled) ออกจาก DB จริงหรือเก็บไว้เป็น fixture ต่อ — **หมายเหตุ (2026-09-13)**: ใช้บัญชี `bruno.testa` ช่วยไล่บั๊ก middleware/proxy รอบนี้ด้วย (ตั้ง role เป็น admin ชั่วคราวระหว่างทดสอบแล้วเปลี่ยนกลับเป็น customer เรียบร้อยหลังทดสอบเสร็จ — ไม่กระทบข้อมูลถาวรของบัญชีนี้)

---

## 🎨 Phase 2A Admin Dashboard — สถานะ Figma design (2026-09-11, พักไว้)

**ไฟล์ Figma ของ Admin Dashboard (แยกจากไฟล์หน้าร้านลูกค้า)**:
- ไฟล์: **"DeskLab-Admin-Dashboard"** — fileKey `jfRFfx5ggUeJCIFuo76ypF`
- URL: `https://www.figma.com/design/jfRFfx5ggUeJCIFuo76ypF/DeskLab-Admin-Dashboard`
- สร้างด้วย Figma account คนละบัญชีกับไฟล์หน้าร้านเดิม (`UqD5VwG7M7IFPZMoFuoSo2`) — ยืนยันแล้วว่า **Chrome/Rail** (key `aa5fc1cf8a78e8f3c0037f2b4263b2cb95ea75b6`) และ **Chrome/TopBar** (key `af8b4ea05557c6bb1a5302fb3d8a72f71c5bee37`) เป็น component จาก library เดียวกัน import ข้ามไฟล์ได้จริงในไฟล์นี้ — แต่ component อื่นๆ ของไฟล์หน้าร้านเดิม (Chip/Active, Chip/Default, Tile/Product, Panel/OrderSummary, Stepper/Qty, Field/Text, Badge/Status) **import ข้ามไฟล์มาไฟล์นี้ไม่ได้** เพราะไม่ได้ publish เป็น library ในบัญชีนี้

**สถานะไฟล์ Figma**: มีครบ 4 เฟรม (Dashboard/Product Management/Order Management/Analytics) design เสร็จ 100% ด้วย KPI/ตาราง/การ์ดที่ตรงธุรกิจจริงแล้ว — เก็บไว้เป็น**ต้นแบบดีไซน์อ้างอิง**เท่านั้น (ดู mockup/เลย์เอาต์คร่าวๆ ได้) **ไม่ได้ใช้เป็นแหล่ง import component เข้าโค้ดโดยตรงอีกต่อไป** เพราะเปลี่ยนมาเขียน Admin Dashboard ตรงในโค้ดแทนแล้ว (ดูหัวข้อถัดไป) — เหตุผลที่เปลี่ยน: Figma MCP ของบัญชีที่ใช้ทำไฟล์นี้ (MisTerToPz., Starter plan) หมดโควตา 20 ครั้ง/เดือนระหว่างทาง ทำให้แก้ Sidebar/Rail ต่อไม่ได้ ผู้ใช้เลยตัดสินใจ (2026-09-11) ย้ายมาออกแบบ+ต่อของจริงในโค้ดเลยง่ายกว่า

**Rail/Sidebar ของ Figma ค้างปัญหาเดิมไว้เป็น reference**: ยังเป็นเมนูลูกค้า (หน้าแรก/สินค้า/ตะกร้า/คำสั่งซื้อ/บัญชี) ไม่ใช่เมนูแอดมิน — จะไม่ไปแก้ต่อใน Figma แล้ว เพราะจะเขียน Sidebar แอดมินใหม่ตรงในโค้ดแทน (ดูหัวข้อถัดไป) — โครงสร้าง/component key เดิมที่เคยสำรวจไว้ (ถ้าจะกลับไปใช้ Figma อีกในอนาคต) ยังอยู่ใน git history ของไฟล์นี้

---

## 🆕 Admin Dashboard เขียนตรงในโค้ด (Next.js) — แผนงาน (อัปเดต 2026-09-11)

**การตัดสินใจ**: ผู้ใช้เลือกเปลี่ยนจากทำ design ใน Figma มาเป็น **เขียน Admin Dashboard ตรงในโค้ด (VS Code) ต่อ Supabase จริงเลย** — เหตุผล: หลีกเลี่ยงปัญหา Figma MCP quota, ได้หน้าที่ใช้งานได้จริงทันที, แก้ design ผ่านโค้ดง่ายกว่า

**ระบบสิทธิ์แอดมิน (ยืนยันล่าสุด 2026-09-11 — แก้ไขจากที่เข้าใจผิดตอนแรก)**:
- ผู้ใช้ยืนยันชัดเจนว่า: **"Poonypat2550" เป็นแค่ตัวอย่างสมมติเท่านั้น ไม่ต้องสร้างจริง** (ไม่ใช่บัญชีลูกค้าจริงที่ต้องสร้าง)
- **บัญชีแอดมินตัวจริงชื่อ `Admin_Poonyapat`**
- ลูกค้าทั่วไป: **สมัครสมาชิกและล็อกอินได้ตามปกติ** ผ่านหน้า `/register` และ `/login` เดิม — ไม่มีอะไรเปลี่ยนแปลงกับ flow ลูกค้าเลย
- แอดมิน (`Admin_Poonyapat`): เป็น **บัญชีแยกต่างหาก ไม่ต้องผ่านการสมัครสมาชิกแบบสาธารณะ (`/register`)** — มีไว้เพื่อ **เข้าหน้า Dashboard เท่านั้น** ไม่ใช้ช้อปปิ้ง/ตะกร้า/ที่อยู่แบบลูกค้าทั่วไป
- **แนวทางเทคนิคที่ใช้จริง**: ยังคงใช้ Supabase Auth เป็นระบบยืนยันตัวตน (reuse session/RLS ที่มีอยู่แล้ว ไม่ต้องสร้างระบบ auth คู่ขนาน) — ตั้งค่า `role = 'admin'` ในตาราง `public.users` ให้บัญชีนี้เท่านั้น (ยังไม่ได้ทำ ดูขั้นตอนที่ 2) — เข้าเว็บผ่านหน้า login แยกของแอดมิน (หรือหน้า `/login` เดิมแต่ redirect ตาม role หลังล็อกอินสำเร็จ)

**✅ ขั้นตอนที่ 1 เสร็จแล้ว (2026-09-11)**: ตอนสร้างบัญชีพบว่าอีเมลที่ผู้ใช้ให้ (`tophero2550@gmail.com`) มีบัญชีลูกค้าเดิมอยู่แล้วในระบบ (username เดิม `top123` สมัครไว้ตั้งแต่ 2026-09-02) — เช็คแล้วว่าบัญชีนี้ว่างเปล่า ไม่มีออเดอร์/ที่อยู่/ตะกร้าผูกอยู่เลย จึงถามผู้ใช้ว่าจะสร้างบัญชีใหม่แยกหรือแปลงบัญชีนี้เป็นแอดมิน — **ผู้ใช้เลือก "แปลงบัญชี top123 นี้เป็นแอดมิน"** จึงอัปเดตโดยตรงใน Supabase (`auth.users` + `public.users`): เปลี่ยน username (`public.users.name`) เป็น `Admin_Poonyapat` และตั้งรหัสผ่านใหม่ตามที่ผู้ใช้ให้มา — **บัญชีแอดมินตอนนี้คือ**: email `tophero2550@gmail.com`, username `Admin_Poonyapat`, user id `31c90da7-4d55-490d-8e39-c7202a0f135b` — ล็อกอินผ่านหน้า `/login` เดิมได้ทันที (รหัสผ่านไม่บันทึกไว้ในเอกสารนี้ด้วยเหตุผลด้านความปลอดภัย — ผู้ใช้เป็นคนตั้งเองแล้ว)

**แผนขั้นตอน (ทำทีละขั้นตอน ห้ามรวดเดียว ตามกติกาที่ผู้ใช้ขอ)**:
1. ~~**เช็ค/เตรียมบัญชีแอดมิน**~~ — ✅ เสร็จแล้ว (ดูรายละเอียดด้านบน)
2. ~~**Migration เพิ่มคอลัมน์ role**~~ — ✅ เสร็จแล้ว (2026-09-11): รัน migration `add_role_column_to_users` เพิ่มคอลัมน์ `role` (text, `not null default 'customer'`, check constraint `users_role_check` จำกัดค่าเฉพาะ `'customer'`/`'admin'`, เพิ่ม index `idx_users_role`) ในตาราง `public.users` แล้ว UPDATE role='admin' ให้บัญชี `Admin_Poonyapat` (id `31c90da7-4d55-490d-8e39-c7202a0f135b`) — ยืนยันผลแล้ว: 1 admin / 4 customer — เช็ค security advisors หลังทำแล้วไม่มีปัญหาใหม่เกิดจากการเปลี่ยนนี้ (มี warning เดิม 2 อย่างที่ไม่เกี่ยวข้อง: `decrement_order_stock` เป็น SECURITY DEFINER และ Leaked Password Protection ปิดอยู่ — บันทึกไว้แล้วก่อนหน้านี้)
3. ~~**RLS/Guard สำหรับแอดมิน**~~ — ✅ เสร็จแล้ว (2026-09-11):
   - เพิ่ม migration `add_admin_rls_policies` — สร้าง `public.is_admin()` (security definer function เช็ค role='admin' ของ auth.uid() ปัจจุบัน กัน RLS recursive lookup บนตาราง users เอง, revoke execute จาก anon/public แล้ว grant ให้เฉพาะ authenticated) แล้วเพิ่ม policy ใหม่ (ไม่ได้ลบ policy เดิม เพิ่มเสริม): `products_admin_all`/`categories_admin_all`/`product_images_admin_all` (ALL), `orders_admin_select`/`orders_admin_update`, `order_items_admin_select`, `payments_admin_select`, `users_admin_select`, `addresses_admin_select` — เช็ค security advisors แล้ว ไม่มีปัญหาใหม่ (มี warning เดิมที่รู้อยู่แล้ว 2 อย่าง ไม่เกี่ยวข้อง)
   - แก้ `src/lib/supabase/middleware.ts` เพิ่ม guard: path ที่ขึ้นต้นด้วย `/admin` → ถ้ายังไม่ล็อกอิน เด้งไป `/login`, ถ้าล็อกอินแต่ `role !== 'admin'` เด้งกลับหน้าแรก — ไม่กระทบ flow ลูกค้าทั่วไปเลย (เช็คเฉพาะตอน path เป็น /admin เท่านั้น)
   - แก้ `src/lib/data/auth.ts` เพิ่มฟิลด์ `role` ใน `CurrentUser` (ดึงจาก `public.users.role`) ไว้ใช้ต่อในหน้า admin layout (ขั้นตอนที่ 4)
   - ยืนยันแล้วด้วย `npm run type-check` (ผ่าน 0 error) และ `npm run lint` (0 error, มีแค่ warning เดิม 2 อย่างที่ไม่เกี่ยวข้อง) บนเครื่องผู้ใช้จริง
   - **หมายเหตุสำคัญสำหรับขั้นตอนที่ 4**: เพื่อให้ URL จริงเป็น `/admin/*` ต้องสร้างโฟลเดอร์ `app/admin/...` แบบ segment จริง (ไม่ใช่ route group วงเล็บ `(admin)` เพราะวงเล็บไม่ปรากฏใน URL) — คนละแบบกับที่เขียนไว้ในแผนเดิมเล็กน้อย ปรับตรงนี้ตอนเริ่มขั้นตอนที่ 4
   - **⚠️ อัปเดตสำคัญ (2026-09-13)**: ตอนนั้นเข้าใจว่า guard นี้ทำงานผ่าน middleware จริง แต่ที่จริงแล้ว **middleware ไม่เคยถูกเรียกทำงานเลยสักครั้งตั้งแต่ขั้นตอนนี้** (ดูหัวข้อ "พบสาเหตุจริง" ด้านล่าง) เพราะไฟล์วางผิดตำแหน่ง — โชคดีที่ `admin/layout.tsx` (ขั้นตอนที่ 4) มีการเช็ค role ซ้ำอีกชั้นอยู่แล้ว (defense in depth) จึงไม่เคยเกิดช่องโหว่ด้านความปลอดภัยจริง — แก้ไขแล้วสมบูรณ์ในหัวข้อด้านล่าง
4. ~~**โครงสร้าง route + layout ใหม่**~~ — ✅ เสร็จแล้ว (2026-09-12):
   - สร้าง `app/admin/` เป็น segment จริง (ตามหมายเหตุที่ปรับจากขั้นตอนที่ 3 — ไม่ใช้ route group วงเล็บ) ครบ 6 route: `/admin` (redirect ไป `/admin/dashboard`), `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/analytics`, `/admin/account`
   - สร้าง `src/components/admin/AdminRail.tsx` + `AdminTopBar.tsx` — สไตล์เดียวกับ Rail.tsx/TopBar.tsx ฝั่งลูกค้าทุกอย่าง (bg-ink, กล่อง 60x58, สี/ฟอนต์เดิม) แต่เมนูคนละชุด: Sidebar 5 ช่อง (แดชบอร์ด/สินค้า/คำสั่งซื้อ/รายงาน/บัญชี — ป้ายสั้นแบบเดียวกับ Rail เดิม) TopBar โชว์ชื่อเต็มของแต่ละหน้าแทน (แดชบอร์ด/จัดการสินค้า/จัดการคำสั่งซื้อ/รายงานและวิเคราะห์ข้อมูล/บัญชีแอดมิน) พร้อมป้าย "โหมดแอดมิน" และเมนู avatar (ลิงก์บัญชี + ออกจากระบบ) แทนตะกร้า
   - สร้าง `app/admin/layout.tsx` — เรียก `getCurrentUser()` แล้วเช็ค role ซ้ำอีกชั้น (defense in depth นอกจาก middleware) ก่อน render Rail/TopBar/children
   - สร้างหน้า placeholder ทั้ง 5 หน้า (dashboard/products/orders/analytics/account) — เนื้อหาจริงรอขั้นตอนที่ 5-8 หน้า account เป็นหน้าเสริม (ไม่อยู่ใน 8 ขั้นตอนหลัก) แสดงข้อมูลบัญชีตัวเองอย่างเดียวไปก่อน
   - ยืนยันด้วย `npm run type-check` (ผ่าน), `npm run lint` (0 error, มีแค่ warning เดิม 2 อย่าง), และ `npm run build` (ผ่าน 100% — เห็น route `/admin`, `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/analytics`, `/admin/account` ขึ้นครบในผลลัพธ์ build จริง) บนเครื่องผู้ใช้จริง
   - ยังไม่ได้ทดสอบผ่านเบราว์เซอร์จริงว่า login ด้วย `Admin_Poonyapat` แล้วเข้า `/admin/dashboard` ได้ และบัญชีลูกค้าทั่วไปเข้าไม่ได้ (build ผ่านอย่างเดียวยังไม่ใช่การทดสอบพฤติกรรมจริง) — แนะนำให้ผู้ใช้ทดสอบเองตอนรัน dev server
5. ~~**หน้า Dashboard** — ต่อข้อมูลจริงจาก Supabase~~ — ✅ เสร็จแล้ว (2026-09-12): สร้าง `src/lib/data/admin-dashboard.ts` (`getDashboardStats()`) ดึง/คำนวณ 6 ค่า (ยอดขายวันนี้, จำนวนออเดอร์วันนี้, ออเดอร์รอจัดส่ง, AOV, ตารางออเดอร์ล่าสุด 10 รายการ, สินค้าขายดี top 5) ตามนิยามที่บันทึกไว้ด้านบน — แก้ `src/app/admin/dashboard/page.tsx` เป็น async Server Component เรียกฟังก์ชันนี้ แสดงการ์ด KPI 4 ใบ + ตารางออเดอร์ล่าสุด (ใช้ `StatusBadge`/`formatBaht` เดิม) + รายการสินค้าขายดี — ยืนยันด้วย `npm run type-check` (ผ่าน), `npm run lint` (0 error, มีแค่ warning เดิม 2 อย่าง), `npm run build` (ผ่าน 100%) บนเครื่องผู้ใช้จริงแล้ว — ผู้ใช้ตรวจสอบผ่านเบราว์เซอร์แล้ว ตัวเลขตรงกับข้อมูลจริง (AOV ฿998 ตรงกับคำนวณมือ)
6. ~~**หน้า Product Management** — CRUD สินค้าจริง~~ — ✅ เสร็จแล้ว (2026-09-12): สร้าง `src/lib/data/admin-catalog.ts` (`getAdminProducts`/`getAdminCategories` ดึงข้อมูลทั้งหมดรวมที่ปิดการขาย), `src/lib/actions/admin-catalog.ts` (create/update/delete/toggle-active สินค้า + create/update/delete หมวดหมู่ — ดักจับ FK violation `23503` จาก order_items แล้วแนะนำปิดการขายแทนลบ), component ใหม่ `ProductsManager.tsx`/`ProductFormModal.tsx`/`CategoryPanel.tsx` — หน้า `/admin/products` มีตารางสินค้าทั้งหมด + ปุ่มเพิ่ม/แก้ไข/ปิด-เปิดการขาย/ลบ + แผงจัดการหมวดหมู่ในตัว — รูปสินค้ารอบนี้ใช้ช่องกรอก URL (ยังไม่ทำอัปโหลดไฟล์จริง) — เจอ lint error `react-hooks/set-state-in-effect` ตอนแรก (เรียก setState ใน useEffect ตรงๆ ตอนรีเซ็ตฟอร์มหลังบันทึกสำเร็จ) แก้ด้วย eslint-disable เฉพาะจุดพร้อมคอมเมนต์อธิบายเหตุผล — ยืนยันด้วย `npm run lint` (0 error), `npm run type-check` (ผ่าน), `npm run build` (ผ่าน 100%) บนเครื่องผู้ใช้จริงแล้ว
7. ~~**หน้า Order Management**~~ — ✅ เสร็จแล้ว (2026-09-12): สร้าง `src/lib/data/admin-orders.ts` (`getAdminOrders`/`getAdminOrderDetail`), `src/lib/actions/admin-orders.ts` (`updateOrderStatusAction` — เปลี่ยนสถานะได้อิสระทั้ง 6 ค่า ไม่บังคับลำดับ ตาม policy `orders_admin_update` เดิม), หน้า `/admin/orders` (ตารางออเดอร์ทั้งหมด), `/admin/orders/[id]` (รายละเอียด: สินค้า/ที่อยู่/ลูกค้า/การชำระเงิน + ฟอร์มเปลี่ยนสถานะ `OrderStatusForm.tsx`), `/admin/orders/[id]/receipt` (ใบเสร็จพิมพ์ได้ด้วย `window.print()` ผ่าน `PrintButton.tsx`) — แก้ `admin/layout.tsx` เพิ่ม `print:hidden` ซ่อน Sidebar/TopBar ตอนพิมพ์ — เจอปัญหา TypeScript ระหว่างทำ: `PageProps<"/admin/orders/[id]">` ของ route ใหม่ error ตอน `npm run type-check` เพราะ type ของ Next.js typed routes ยังไม่ถูก generate (ต้องรัน `next build`/`next dev` ก่อนอย่างน้อย 1 ครั้งถึงจะรู้จัก route ใหม่) แก้โดยรัน `npm run build` ก่อนแล้วค่อย type-check/lint ซ้ำก็ผ่านหมด — ยืนยันด้วย `npm run type-check`, `npm run lint` (0 error, มีแค่ warning เดิม 2 อย่าง), `npm run build` (ผ่าน 100% เห็น route `/admin/orders/[id]` และ `/admin/orders/[id]/receipt` ในผลลัพธ์) บนเครื่องผู้ใช้จริงแล้ว
8. ~~**หน้า Analytics**~~ — ✅ เสร็จแล้ว (2026-09-13, ขั้นตอนสุดท้าย): สร้าง `src/lib/data/admin-analytics.ts` (`getSalesOverTime`/`getTopProducts`/`getTopCustomers` ใช้ VALID_SALES_STATUSES เดียวกับ dashboard เสมอ), component `SalesBarChart.tsx` (กราฟแท่งด้วย CSS ล้วน ไม่เพิ่ม chart library — คำนวณความสูงเป็น px เอง เพราะ % height ของ flex child แบบ align flex-end ไม่ทำงานถ้า parent ไม่กำหนดความสูงตรงๆ), หน้า `/admin/analytics` แสดงกราฟยอดขาย 14 วันล่าสุด + ตารางสินค้าขายดี top 10 (พร้อมรายได้) + ตารางลูกค้า top 10 ตามยอดใช้จ่าย — ยืนยันด้วย `npm run type-check`, `npm run lint` (0 error, มีแค่ warning เดิม 2 อย่าง), `npm run build` (ผ่าน 100%) บนเครื่องผู้ใช้จริงแล้ว

**🎉 แผน Admin Dashboard เขียนตรงในโค้ด ครบทั้ง 8 ขั้นตอนแล้ว (2026-09-13)** — บัญชีแอดมิน, role/RLS/guard, route/layout, redirect หลังล็อกอิน, Dashboard, Product Management (CRUD), Order Management (สถานะ+ใบเสร็จ), Analytics — ทุกขั้นตอนต่อ Supabase จริงและผ่าน type-check/lint/build บนเครื่องผู้ใช้จริงครบทุกครั้ง

### 🐛 ปัญหาที่ผู้ใช้เจอ (2026-09-12): ล็อกอินด้วย `Admin_Poonyapat` แล้วไม่เข้า Dashboard

ผู้ใช้ทดสอบตามที่แนะนำ (login ด้วยบัญชีแอดมิน) แล้วรายงานว่า: ล็อกอินสำเร็จ แต่ระบบพาไปหน้าลูกค้าทั่วไป (โปรไฟล์/หน้าแรก) ไม่ใช่ `/admin/dashboard` — screenshot ยืนยันว่าบัญชี/ข้อมูลถูกต้อง (username `Admin_Poonyapat`, email `tophero2550@gmail.com` ขึ้นถูก) ปัญหาไม่ได้อยู่ที่บัญชีหรือ RLS แต่อยู่ที่ **flow หลังล็อกอิน**

**สาเหตุที่พบจริงจากการอ่านโค้ด** (`src/lib/actions/auth.ts`, `signInAction`):
- หลังล็อกอินสำเร็จ โค้ดเรียก `redirect("/")` เสมอ ไม่มีการเช็ค `role` เลย — ไม่ว่าจะเป็นลูกค้าหรือแอดมินก็โดนพาไปหน้าแรกเหมือนกันหมด
- middleware (ขั้นตอนที่ 3) มี guard ที่ "กันคนที่ไม่ใช่แอดมินออกจาก `/admin/*`" ได้ถูกต้อง และตั้ง `?redirectTo=` ไว้ตอนเด้งคนที่ยังไม่ล็อกอินไป `/login` — แต่ `LoginForm.tsx`/`page.tsx` ไม่เคยอ่านหรือส่งต่อค่า `redirectTo` นี้เลย เลยไม่มีทางกลับไปหน้าที่ตั้งใจจะเข้าอัตโนมัติ
- สรุป: **หน้า `/admin/dashboard` มีอยู่จริงและทำงานได้** (ยืนยันแล้วจาก build ขั้นตอนที่ 4) เพียงแต่ไม่มีอะไรพาแอดมินไปที่นั่นหลังล็อกอิน ต้องพิมพ์ URL `/admin` หรือ `/admin/dashboard` เองเท่านั้นถึงจะเห็น — เป็นส่วนที่ยังไม่ได้ทำ ไม่ใช่บั๊กของสิ่งที่สร้างไปแล้ว

**✅ แก้ไขแล้ว (2026-09-12)**: แก้ `signInAction` ใน `src/lib/actions/auth.ts` — หลังล็อกอินสำเร็จ เช็ค `role` ของผู้ใช้จาก `public.users` ก่อน `redirect` ถ้า `role === 'admin'` ให้ `redirect("/admin/dashboard")` แทน ถ้าเป็นลูกค้าทั่วไปพฤติกรรมเดิมทุกอย่างไม่เปลี่ยน (`redirect("/")`) — ไม่กระทบ flow ลูกค้าเลย เพราะเช็คแค่ role แล้วแยกปลายทาง — ยืนยันด้วย `npm run type-check` (ผ่าน 0 error) และ `npm run lint` (0 error, มีแค่ warning เดิม 2 อย่างที่ไม่เกี่ยวข้อง) บนเครื่องผู้ใช้จริงแล้ว — **ผู้ใช้ทดสอบจริงผ่านเบราว์เซอร์แล้ว (2026-09-12): ล็อกอินด้วย `Admin_Poonyapat` เด้งเข้า `/admin/dashboard` อัตโนมัติถูกต้อง เห็น Sidebar/TopBar แอดมินครบ (แดชบอร์ด/สินค้า/คำสั่งซื้อ/รายงาน/บัญชี + ป้าย "โหมดแอดมิน") — ปิดปัญหานี้สมบูรณ์**
- ขอบเขตที่ยังไม่ทำ (ทำทีละอย่างตามกติกา): รองรับ `redirectTo` แบบเต็มรูปแบบ (เช่น แอดมินโดนเด้งจาก `/admin/products` ไป `/login` แล้วล็อกอินเสร็จกลับไป `/admin/products` เป๊ะๆ) — เคสหลักที่ผู้ใช้เจอ (ล็อกอินแล้วไปหน้า Dashboard ให้ได้) แก้แล้ว ถ้าต้องการ fine-tune ส่วนนี้ทีหลังค่อยทำแยกเป็นอีกขั้นตอน

### 📝 แผนขั้นตอนที่ 5 (2026-09-12) — หน้า Dashboard ต่อข้อมูลจริง

ตรวจ schema จริงใน Supabase ก่อนแล้ว (orders 16 แถว, order_items 19 แถว, สถานะจริงที่มีตอนนี้: pending/paid/processing/cancelled — ยังไม่มี shipped/delivered ในข้อมูลจริง) กำหนดนิยามตัวเลขแต่ละตัวไว้ดังนี้ (จะได้ไม่ต้องเดาใหม่ทีหลัง):
- **validSalesStatuses** = `paid, processing, shipped, delivered` (นับเป็นยอดขายจริง — ไม่นับ `pending` เพราะยังไม่ชำระ ไม่นับ `cancelled`)
- **ยอดขายวันนี้** = sum(total_amount) ของออเดอร์ที่ `created_at` = วันนี้ และสถานะอยู่ใน validSalesStatuses
- **จำนวนออเดอร์ (วันนี้)** = นับออเดอร์ทั้งหมดที่สร้างวันนี้ (ทุกสถานะ รวม pending ด้วย เพื่อสะท้อนปริมาณการสั่งซื้อจริง)
- **ออเดอร์รอจัดส่ง** = นับออเดอร์ที่ `order_status = 'processing'` (ทั้งหมด ไม่จำกัดวันนี้ — ตรงกับ label เดิมในระบบ "รอจัดส่ง" ที่ใช้กับสถานะ processing อยู่แล้วใน `orderStatusLabel`)
- **AOV (มูลค่าเฉลี่ยต่อออเดอร์)** = ค่าเฉลี่ย total_amount ของออเดอร์ทั้งหมด (all-time) ที่สถานะอยู่ใน validSalesStatuses
- **ตารางออเดอร์ล่าสุด** = 10 ออเดอร์ล่าสุดเรียงตาม created_at (ทุกสถานะ) พร้อมชื่อลูกค้า (join `users.name`), ยอดรวม, badge สถานะ, วันที่
- **สินค้าขายดี** = top 5 สินค้าตามยอด quantity ที่ขายได้ รวมจาก `order_items` เฉพาะของออเดอร์ที่สถานะอยู่ใน validSalesStatuses

**แนวทางเทคนิค**: สร้าง `src/lib/data/admin-dashboard.ts` ฟังก์ชัน `getDashboardStats()` ดึงข้อมูลจาก Supabase ตรงๆ (ใช้ policy admin ที่เปิดไว้ตั้งแต่ขั้นตอนที่ 3) แล้วคำนวณสรุปฝั่ง JS (ข้อมูลยังน้อย ไม่ต้องทำ RPC/view เพิ่ม) ตามแพทเทิร์น graceful-degrade เดียวกับ `catalog.ts` (คืนค่าว่าง/0 ถ้าดึงไม่ได้ ไม่ throw) — หน้า `src/app/admin/dashboard/page.tsx` เปลี่ยนเป็น async Server Component เรียกฟังก์ชันนี้ แล้วโชว์การ์ด KPI 4 ใบ + ตารางออเดอร์ล่าสุด (ใช้ `StatusBadge`/`formatBaht`/`orderStatusLabel` จาก `@/lib/demo-data` เดิมให้สไตล์ตรงกับหน้าลูกค้า) + ตารางสินค้าขายดี

### 📝 แผนขั้นตอนที่ 6 (2026-09-12) — หน้า Product Management (CRUD)

ผู้ใช้ยืนยันหน้า Dashboard (ขั้นตอนที่ 5) ตรงกับข้อมูลจริงแล้ว (screenshot AOV ฿998 ตรงกับที่คำนวณเช็คไว้: 2 paid + 3 processing รวม ฿4,990 / 5 ออเดอร์) — ไปขั้นตอนที่ 6 ต่อ

เช็ค FK constraint จริงก่อนออกแบบ (สำคัญมากสำหรับปุ่มลบ):
- `products_category_id_fkey` → **ON DELETE SET NULL**: ลบหมวดหมู่ได้เสมอ ปลอดภัย สินค้าที่อยู่ในหมวดนั้นจะกลายเป็น "ไม่มีหมวดหมู่" อัตโนมัติ ไม่ error
- `order_items_product_id_fkey` → **ON DELETE RESTRICT**: ลบสินค้าที่เคยถูกสั่งซื้อไปแล้วไม่ได้เด็ดขาด (DB จะ error กันไว้) ต้องดักจับ error นี้แล้วแนะนำให้ "ปิดการขาย" (toggle `is_active=false`) แทนการลบจริง
- `product_images_product_id_fkey` / `cart_items_product_id_fkey` / `reviews_product_id_fkey` → CASCADE ทั้งหมด ลบสินค้าที่ไม่เคยถูกสั่งซื้อได้แบบไม่ต้องลบข้อมูลลูกที่เกี่ยวข้องเอง

**ขอบเขตที่ทำ**:
1. Data layer ใหม่ `src/lib/data/admin-catalog.ts` — `getAdminProducts()` (ดึงสินค้าทั้งหมดรวมที่ปิดการขาย พร้อมชื่อหมวดหมู่+รูปหลัก), `getAdminCategories()`
2. Server actions ใหม่ `src/lib/actions/admin-catalog.ts` — `createProductAction`, `updateProductAction`, `deleteProductAction` (ดักจับ FK violation code `23503` จาก order_items แล้วคืน error message แนะนำปิดการขายแทน), `toggleProductActiveAction`, `createCategoryAction`, `updateCategoryAction` (เปลี่ยนชื่อ), `deleteCategoryAction`
3. **การจัดการรูปสินค้า**: รอบนี้ยังไม่ทำระบบอัปโหลดไฟล์ — ใช้ช่องกรอก URL รูปแบบข้อความ (ตรงกับแบบที่ใช้อยู่แล้วคือ static asset `public/products/*.svg`) ถ้าต้องการอัปโหลดไฟล์จริงทีหลังค่อยทำเป็นงานแยก
4. หน้า `src/app/admin/products/page.tsx` — ตารางสินค้าทั้งหมด + ปุ่ม "เพิ่มสินค้า" เปิด modal (component ใหม่ `ProductFormModal.tsx` ใช้ backdrop pattern เดียวกับ `AvatarCropModal.tsx` เดิม) ใช้ modal เดียวกันทั้งเพิ่ม/แก้ไข แต่ละแถวมีปุ่ม แก้ไข / ปิด-เปิดการขาย / ลบ — พร้อมแผงจัดการหมวดหมู่ (`CategoryPanel.tsx`) เพิ่ม/เปลี่ยนชื่อ/ลบได้

### 📝 แผนขั้นตอนที่ 7 (2026-09-12) — หน้า Order Management

ผู้ใช้ยืนยันขั้นตอนที่ 6 (Product Management) ผ่านแล้ว พร้อมบอกให้ทำขั้นตอนที่ 7 ต่อและ "Allow ทุกอย่างที่ทำ" (ลดการหยุดถามยืนยันย่อยระหว่างทำ — แต่ยังคงทำทีละขั้นตอนใหญ่ + บันทึกแผนก่อนเริ่มตามกติกาเดิม)

**ขอบเขต**: ดูรายละเอียดออเดอร์ (สินค้า/ที่อยู่จัดส่ง/ข้อมูลลูกค้า/การชำระเงิน), เปลี่ยนสถานะออเดอร์, พิมพ์ใบเสร็จ

**การตัดสินใจ**:
- policy `orders_admin_update` (ทำไว้ขั้นตอนที่ 3) เป็น `using/with check (is_admin())` แบบไม่จำกัดเงื่อนไข — แอดมินเปลี่ยนสถานะออเดอร์เป็นค่าไหนก็ได้ใน 6 ค่า (pending/paid/processing/shipped/delivered/cancelled) ไม่บังคับลำดับ (ต่างจากฝั่งลูกค้าที่ถูกจำกัดแค่ pending→cancelled เท่านั้น)
- รอบนี้เปลี่ยนแค่ `orders.order_status` เท่านั้น **ไม่แตะตาราง payments** (เช่นไม่ auto-sync payment_status ตาม order_status) — ถ้าต้องการ sync ทีหลังค่อยทำแยก
- ใบเสร็จ: ทำเป็นหน้า print-friendly ธรรมดา (route แยก) มีปุ่มกดพิมพ์ (window.print()) ไม่ทำ PDF export

**ไฟล์ที่จะสร้าง**:
1. `src/lib/data/admin-orders.ts` — `getAdminOrders()` (รายการสรุปทุกออเดอร์+ชื่อลูกค้า), `getAdminOrderDetail(id)` (รายละเอียดเต็ม: สินค้าในออเดอร์, ที่อยู่จัดส่ง, ข้อมูลลูกค้า, การชำระเงินล่าสุด)
2. `src/lib/actions/admin-orders.ts` — `updateOrderStatusAction`
3. `src/app/admin/orders/page.tsx` — ตารางออเดอร์ทั้งหมด ลิงก์ไปหน้ารายละเอียด
4. `src/app/admin/orders/[id]/page.tsx` — รายละเอียดออเดอร์ + ฟอร์มเปลี่ยนสถานะ + ปุ่มไปหน้าใบเสร็จ
5. `src/app/admin/orders/[id]/receipt/page.tsx` — หน้าใบเสร็จพิมพ์ได้

### 📝 แผนขั้นตอนที่ 8 (2026-09-13) — หน้า Analytics (ขั้นตอนสุดท้ายของแผน 8 ขั้นตอน)

ผู้ใช้ยืนยันให้เริ่มขั้นตอนสุดท้ายต่อ

**ขอบเขต**: ยอดขายตามช่วงเวลา, สินค้าขายดี (ขยายจาก dashboard ให้ดูได้มากขึ้น+เห็นยอดเงินด้วย), ลูกค้า (top spender)

**นิยามตัวเลข** (ใช้ VALID_SALES_STATUSES เดียวกับ dashboard เสมอ: paid/processing/shipped/delivered — ไม่นับ pending/cancelled):
- **ยอดขายตามช่วงเวลา**: กราฟแท่ง SVG ง่ายๆ (ไม่เพิ่ม dependency ใหม่ วาดเป็น inline SVG แบบเดียวกับไอคอนใน AdminRail) แสดงยอดขายรายวันย้อนหลัง 14 วัน นับเฉพาะออเดอร์ที่อยู่ใน VALID_SALES_STATUSES
- **สินค้าขายดี**: top 10 ตาม quantity ที่ขายได้ (all-time) พร้อมยอดรายได้รวมต่อสินค้า (ต่างจาก dashboard ที่โชว์แค่ top 5 ไม่มียอดเงิน)
- **ลูกค้า**: top 10 ลูกค้าตามยอดใช้จ่ายรวม (all-time) พร้อมจำนวนออเดอร์ของแต่ละคน

**ไฟล์ที่จะสร้าง**: `src/lib/data/admin-analytics.ts` (`getSalesOverTime`, `getTopProducts`, `getTopCustomers`) + หน้า `src/app/admin/analytics/page.tsx` (async Server Component เรียกทั้ง 3 ฟังก์ชัน render กราฟแท่ง + ตาราง 2 ตาราง) — ไม่ต้องมี server action ใหม่ (หน้านี้อ่านอย่างเดียว ไม่มีฟอร์มแก้ไข)

### 🐛 แก้บั๊กหลังปิดแผน 8 ขั้นตอน (2026-09-13): แอคเคาท์แอดมินไปอยู่หน้าลูกค้าหลัง restart host

ผู้ใช้แจ้งว่า: เดิมล็อกอินแอดมินแล้วเข้า `/admin/dashboard` ได้ปกติ (ตามที่แก้ไว้ก่อนหน้านี้) แต่พอ **restart dev server / รัน host ใหม่** แล้วเปิดเว็บขึ้นมา (โดย session/cookie เดิมยังอยู่ ไม่ได้ล็อกเอาต์) กลับไปเจอหน้าลูกค้าแทนที่จะเป็น Dashboard

**สาเหตุที่เข้าใจตอนแรก (ไม่ครบ — ดูสาเหตุจริงด้านล่าง)**: การแก้ไขรอบก่อน (`signInAction` เช็ค role แล้ว redirect ไป `/admin/dashboard`) ทำงานเฉพาะ "ตอนล็อกอินสำเร็จครั้งใหม่" เท่านั้น — ถ้า session เดิมยังอยู่ (ไม่ได้ผ่าน signInAction อีกครั้ง) จะไม่มีโค้ดส่วนไหนพาแอดมินกลับไป dashboard เลย

**การแก้ไขรอบแรก (ยังไม่พอ)**: ย้าย logic ไปที่ `src/lib/supabase/middleware.ts` (ตั้งใจให้ทำงานทุก request ไม่ใช่แค่ตอนล็อกอิน) — เพิ่มเงื่อนไข: ถ้าล็อกอินอยู่และ role='admin' และ path ที่ขอไม่ใช่โซนแอดมินและไม่ใช่หน้า auth flow ให้ redirect ไป `/admin/dashboard` เสมอ — ยืนยันด้วย type-check/lint/build ผ่านหมด **แต่ผู้ใช้ทดสอบจริงแล้วรายงานว่ายังไม่ได้ผล** (ยัง "มาหน้า User อยู่ ยังไม่ได้อยู่หน้า Dashboard" พร้อม screenshot) — ดูหัวข้อถัดไปสำหรับสาเหตุจริงและการแก้ไขที่สมบูรณ์

### ✅ พบสาเหตุจริงและแก้เสร็จสมบูรณ์แล้ว (2026-09-13, รอบสอง) — บั๊ก "แอดมินไปอยู่หน้าลูกค้า" ไม่เกี่ยวกับ restart เลย แต่เพราะ **middleware ไม่เคยถูกเรียกทำงานเลยสักครั้ง**

ผู้ใช้ทดสอบการแก้ไขรอบแรก (ย้าย logic ไปไว้ที่ `src/lib/supabase/middleware.ts`) แล้วรายงานว่ายังไม่ได้ผล ("ยังมาหน้า User อยู่ ยังไม่ได้อยู่หน้า Dashboard") พร้อม screenshot ยืนยัน — จึงไล่บั๊กใหม่ทั้งหมดโดยตรงบนเครื่องผู้ใช้จริง (รัน dev server เอง + ใช้ built-in browser ล็อกอินด้วยบัญชีทดสอบ `bruno.testa@desklab.test` ที่ตั้ง role เป็น admin ชั่วคราวเพื่อจำลองสถานการณ์ โดยไม่แตะบัญชีแอดมินจริง แล้วเปลี่ยน role กลับเป็น customer ทันทีหลังทดสอบเสร็จ)

**ขั้นตอนการวินิจฉัย**:
1. เพิ่ม `console.log` ชั่วคราวในทุกจุดของ `updateSession()` (`src/lib/supabase/middleware.ts`) — รันจริงแล้วพบว่า **log ไม่ขึ้นเลยแม้แต่บรรทัดเดียว** ไม่ว่าจะเข้าหน้าไหน
2. เพิ่ม `console.log` ที่ฟังก์ชัน `middleware()` ใน `middleware.ts` (ไฟล์ root) ตรงๆ — ก็ไม่ขึ้นเช่นกัน แม้จะ restart dev server ใหม่หมดแล้วก็ตาม
3. ตรวจ `npm run build` เห็นบรรทัด `ƒ Proxy (Middleware)` ในผลลัพธ์ (ไม่ใช่ `ƒ Middleware` แบบที่คุ้นเคย) — เป็นเบาะแสว่า Next.js เวอร์ชันนี้ (**16.3.3** — เวอร์ชันใหม่มาก) เปลี่ยนแนวคิดไฟล์นี้ไปแล้ว
4. ตรวจซอร์สจริงใน `node_modules/next/dist/build/utils.js` และ `node_modules/next/dist/build/templates/middleware.js` พบ 2 สาเหตุจริงพร้อมกัน:
   - **สาเหตุหลัก**: โปรเจกต์นี้ใช้โครงสร้าง `src/` (โค้ดทั้งหมดอยู่ใต้ `src/app`, `src/lib`, `src/components`) แต่ไฟล์ `middleware.ts` ถูกวางไว้ที่ **root ของโปรเจกต์** (ข้างๆ `package.json`) — Next.js จะมองหาไฟล์นี้ใน `src/middleware.ts` เมื่อโปรเจกต์ใช้โครงสร้าง `src/` ตำแหน่งที่ root เฉยๆ จึงไม่ถูกตรวจพบเลย ทำให้ middleware **ไม่เคยทำงานแม้แต่ครั้งเดียวตั้งแต่ขั้นตอนที่ 3** (แปลว่า guard `/admin/*` เดิมก็ไม่เคยถูกบังคับผ่าน middleware จริงๆ ที่ป้องกันได้จริงคือการเช็คซ้ำใน `admin/layout.tsx` เพียงอย่างเดียวมาตลอด — โชคดีที่มันเป็น defense-in-depth อยู่แล้ว เลยไม่เคยมีช่องโหว่ด้านความปลอดภัยเกิดขึ้นจริง)
   - **สาเหตุรอง**: Next.js 16 เปลี่ยนชื่อ convention ไฟล์นี้จาก `middleware.ts` เป็น `proxy.ts` แล้ว (ของเดิมยังใช้ได้แต่จะขึ้น warning "The middleware file convention is deprecated. Please use proxy instead.")
5. ทดสอบแก้โดยย้ายไฟล์ไป `src/middleware.ts` ก่อน (ยังไม่เปลี่ยนชื่อ) — รัน dev server ใหม่ทั้งหมด (ต้อง `taskkill` process เดิมเพราะ `next dev` บน Windows spawn child process แยก ปิดแค่ terminal ไม่พอ) → **log ขึ้นทันที และ redirect ทำงานถูกต้อง** ยืนยันสาเหตุจริงครบถ้วน

**การแก้ไขสุดท้าย**:
1. ย้าย `middleware.ts` (root) → **`src/proxy.ts`** พร้อมเปลี่ยนชื่อฟังก์ชันที่ export จาก `middleware` เป็น `proxy` (ตาม Next.js 16 convention ใหม่ ไม่มี warning อีกแล้ว) — เนื้อหาโลจิกข้างในเหมือนเดิมทุกอย่าง แค่เรียก `updateSession()` เหมือนเดิม
2. ลบไฟล์ `middleware.ts` ที่ root ทิ้ง (ย้ายไปอยู่ที่เดียวคือ `src/proxy.ts`)
3. ปรับปรุง `src/lib/supabase/middleware.ts` เพิ่มเติม (นอกจากที่แก้ไว้รอบแรก): ตอน redirect แอดมินไป `/admin/dashboard` ต้องคัดลอกคุกกี้ session ที่ refresh แล้วจาก `supabaseResponse` มาใส่ใน redirect response ตัวใหม่ด้วย (เดิมไม่คัดลอก ถ้า token เพิ่งต่ออายุพอดีตอน request นั้นคุกกี้ใหม่จะหายไป) — เป็นการแก้เสริมความทนทาน ไม่ใช่สาเหตุหลักของบั๊กนี้
4. ลบ `console.log` ชั่วคราวทั้งหมดที่ใส่ไว้ตอนไล่บั๊กออกหมดแล้ว

**ทดสอบยืนยันซ้ำแบบจำลองสถานการณ์จริงของผู้ใช้ครบทุกเคส** (ด้วยบัญชีทดสอบ `bruno.testa`, คืน role เป็น customer แล้วหลังทดสอบเสร็จ):
- ล็อกอินสด → เด้งเข้า `/admin/dashboard` ถูกต้อง (เหมือนเดิม)
- ล็อกอินค้างไว้แล้วเข้าหน้าลูกค้าอื่น (เช่น `/cart`) → เด้งกลับ `/admin/dashboard` อัตโนมัติ ✅
- **จำลองเคสตรงที่ผู้ใช้เจอ**: restart dev server ทั้งหมดขณะ session แอดมินยังอยู่ แล้วเปิด `/` ใหม่ → เด้งเข้า `/admin/dashboard` อัตโนมัติทันที ✅ (ก่อนหน้านี้ค้างที่หน้าลูกค้าเสมอ)

ยืนยันด้วย `npm run type-check` (0 error), `npm run lint` (0 error, มีแค่ warning เดิม 2 อย่างที่ไม่เกี่ยวข้อง), `npm run build` (ผ่าน 100%, เห็น `ƒ Proxy (Middleware)` ในผลลัพธ์ ไม่มี deprecation warning แล้ว) บนเครื่องผู้ใช้จริงแล้วครบ

**ผลข้างเคียงสำคัญที่ผู้ใช้ควรรู้**: เพราะเพิ่งพบว่า middleware ไม่เคยทำงานมาตั้งแต่ขั้นตอนที่ 3 (2026-09-11) การ์ด `/admin/*` ที่ตั้งใจไว้ 2 ชั้น (middleware + layout) จริงๆ แล้วทำงานแค่ชั้นเดียวมาตลอด (layout เท่านั้น) — ตอนนี้แก้ให้ทำงานครบ 2 ชั้นจริงแล้ว ถือเป็นการเสริมความปลอดภัยเพิ่มเติมด้วย ไม่ใช่แค่แก้บั๊ก UX


## ⏸️ พักงานไว้ก่อน (2026-09-14)

ผู้ใช้แจ้งว่า **ฟีเจอร์หลักๆ ที่วางแผนไว้ทำครบหมดแล้ว ขอพักงานไว้ก่อน** — เซสชันถัดไปเปิดไฟล์นี้แล้วอ่านหัวข้อ "ขั้นต่อไปที่แนะนำ" ด้านล่างได้เลยว่ามีอะไรค้างเป็นตัวเลือกอยู่บ้าง ไม่มีงานเร่งด่วนที่ต้องทำต่อทันที

## 🔜 ขั้นต่อไปที่แนะนำ (2026-09-22 ล่าสุด)

**✅ แผน "โหลดหน้าช้า + Responsive มือถือ/ไอแพด" (2026-09-21/22) — ปิดงานสมบูรณ์ทั้ง 2 ส่วนแล้ว commit/push ขึ้น GitHub ครบ**

**ส่วนที่ 1 (ความเร็วโหลดหน้า) — เสร็จแล้ว, commit `b49064e`**: วินิจฉัยจริงพบว่าส่วนใหญ่ของแอปใช้ `Promise.all` อยู่แล้ว (Home/Shop/Checkout/Cart) และ `catalog.ts` ไม่มี `select('*')` เกินจำเป็นอยู่แล้ว — จุดที่แก้จริงมีจุดเดียว: `product/[slug]/page.tsx` เคยดึง `getCategories()` แยกทีหลัง `getProductBySlug()` ทั้งที่ไม่เกี่ยวกัน รวมเป็น `Promise.all` เดียวแล้ว — เพิ่ม `loading.tsx` (skeleton) ให้ `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/account/orders` (หน้า Admin ยังไม่ทำ ต่ำสุดในลำดับความสำคัญ) — ผ่าน type-check/lint/build + ทดสอบเบราว์เซอร์จริงทุกหน้าไม่มี error

**ส่วนที่ 2 (Responsive มือถือ/ไอแพด) — เสร็จแล้ว, commit `e0d9ea2`**: ทดสอบทุกหน้าลูกค้าจริงที่ 375px/768px/1024px + regression check ที่ desktop ผ่าน built-in browser พบและแก้บั๊กจริง 6 จุด:
1. **`shop/page.tsx` + `CartAside.tsx`** — คอนเทนเนอร์เดิมเป็น `flex` row ตายตัว + `CartAside` กว้างคงที่ 340px ล้น/บีบกริดสินค้าจนแตกบนจอ <1024px — แก้เป็น `flex-col` สแต็กก่อน แล้วเป็น `lg:flex-row`/`lg:w-[340px]` ที่ 1024px ขึ้นไป
2. **`LoginForm.tsx` + `RegisterForm.tsx`** — การ์ดฟอร์มกว้างคงที่ `w-[400px]` ล้นจอมือถือ 375px ตรงๆ (400 > 375) — แก้เป็น `w-full max-w-[400px]`
3. **`AddressCard.tsx`** — div ฝั่งซ้ายไม่มี `min-w-0` ที่อยู่ยาวๆ อาจดันการ์ดกว้างเกินจอได้ — เพิ่ม `min-w-0`
4. **Home/Shop/Checkout/Product-detail** — padding ข้างตายตัว `px-[28px]` กินพื้นที่จอมือถือเกินจำเป็น — ลดเหลือ `px-4` บนมือถือ/แท็บเล็ต กลับไป `px-[28px]` ที่ `lg:` ให้ตรงกับ Cart ที่เคยแก้ไปแล้วรอบก่อน
5. **`account/orders/loading.tsx`** — เดิมใส่ `px-[28px]` เพิ่มเองทั้งที่หน้าจริงไม่มี padding ของตัวเอง (พึ่ง `Container` จาก `account/layout.tsx`) ทำให้ skeleton เยื้องผิดตำแหน่งเทียบกับเนื้อหาจริง — ตัดออก
6. อัปเดต `loading.tsx` ทั้งหมดที่เกี่ยวข้องให้ตรงกับโครงสร้างใหม่

**ที่ตรวจแล้วว่า "responsive ดีอยู่แล้ว ไม่ต้องแก้"**: Home hero/category/featured grid, `ShopCatalog.tsx` (chip แถวเลื่อนแนวนอน + grid 2/3 คอลัมน์), `CheckoutForm.tsx` (`flex-col lg:flex-row`/`w-full lg:w-80` อยู่แล้ว), `account/orders/page.tsx` + `account/layout.tsx` + `AccountSidebar.tsx` (สแต็กแนวตั้งบนมือถือ, แถวบน `md:`/`lg:` อยู่แล้ว), `ProfileForm.tsx`, `cart/page.tsx` + `CartAnimatedSections.tsx` (แก้ไปแล้วรอบก่อน 2026-09-18), `ProductGallery.tsx`/`ProductTabs.tsx`/`ProductCard.tsx`, `Footer.tsx` (`grid-cols-1 sm:grid-cols-2 md:grid-cols-3`), `TopBar.tsx` (แก้ไปแล้วรอบก่อน), `account/orders/[id]/page.tsx`

**จุดที่รู้อยู่แล้วว่ายังไม่ได้แตะ/เป็นทางเลือกในอนาคต**:
- **Rail.tsx (แถบเมนูซ้าย 76px ถาวรทุกหน้า)** — ไม่ได้ทำ responsive ให้ (เช่น ยุบเป็น bottom-nav บนมือถือ) เพราะเป็นการเปลี่ยนโครง navigation หลักทั้งเว็บ ใหญ่กว่าขอบเขต "แก้บั๊ก overflow" รอบนี้ + ไม่ได้ทำให้ UI ล้น (กว้างคงที่แต่ไม่ error) เก็บไว้เป็นตัวเลือกถ้าผู้ใช้ต้องการปรับ navigation จริงๆ ในอนาคต
- **Admin pages** (`/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/analytics`) — ยังไม่ได้ตรวจ responsive เลยรอบนี้ (priority ต่ำสุดตามแผนเดิม เพราะเป็นหน้าฝั่งพนักงานใช้งานบนจอกว้างเป็นหลัก)
- **Admin routes ยังไม่มี `loading.tsx`** — deferred จากแผนเดิมส่วนที่ 1 เช่นกัน

**ยืนยันคุณภาพก่อน commit ทั้ง 2 รอบ**: `npm run type-check` (0 error), `npm run lint` (0 error, มีแค่ warning เดิม 5 จุดเรื่อง `<img>` ที่ไม่เกี่ยวข้อง), `npm run build` (ผ่าน 100% ครบ 24 route) — ทดสอบเบราว์เซอร์จริงที่ 375px/768px/1024px + regression ที่ desktop ทุกครั้ง

**Commit/Push**: ผู้ใช้อนุมัติล่วงหน้า ("ทำResponsive มือถือ/ไอแพดเสร็จแล้ว Commit/push ได้เลย") — แยกเป็น 2 commit ตามลำดับที่ทำเสร็จ:
- `b49064e` "perf: parallelize product-detail data fetch and add loading skeletons" (ส่วนที่ 1)
- `e0d9ea2` "fix: responsive layout for mobile and tablet screens" (ส่วนที่ 2)
ทั้งคู่ push ขึ้น `main` แล้ว (`fb992a1..b49064e..e0d9ea2`) — Vercel จะ auto-deploy ให้อัตโนมัติ (ยังไม่ได้เข้าไปตรวจสอบผลลัพธ์บน production จริงหลัง deploy รอบนี้ — เป็นขั้นต่อไปที่แนะนำถ้าผู้ใช้ต้องการให้ตรวจสอบต่อ)

---

**⏸️ งาน Micro-animation พักไว้ก่อน (2026-09-18)**: ผู้ใช้แจ้งให้พักงานแอนิเมชันไว้ก่อน (ทำเสร็จไปแล้ว 6 ขั้นตอน: Shop card hover/zoom/tap, fade-in/stagger, add-to-cart feedback, Product-Detail gallery, Home hero, Cart) — **คิวที่เหลือ (Checkout, Order-History, Admin Dashboard) ยังไม่ได้ทำ เก็บไว้ทำทีหลัง**

**🎉 Deploy ร้านค้าขึ้น Vercel — สำเร็จสมบูรณ์แล้ว 100% (2026-09-18)**: URL จริงคือ **https://desk-lab-omega.vercel.app/** — Auto-deploy ทุกครั้งที่ push ขึ้น `main`

**สิ่งที่ยังไม่ได้ทำ/ค้างไว้เป็นทางเลือกในอนาคต**:
- ตรวจสอบผลลัพธ์ deploy บน production หลัง push commit `b49064e`/`e0d9ea2` (งานความเร็ว+responsive รอบนี้)
- ทดสอบ flow เต็มบนเว็บ production (สมัคร/ล็อกอิน/เพิ่มตะกร้า/checkout จริง)
- ผูกโดเมนของตัวเอง (ตอนนี้ใช้ `desk-lab-omega.vercel.app` ฟรีของ Vercel)
- สลับ Opn Payments เป็นโหมด live (ตอนนี้ยังเป็น sandbox)
- ระบบอัปโหลดรูปสินค้าจริง (ตอนนี้ใช้ช่องกรอก URL แทน)
- Sync สถานะ orders กับตาราง payments อัตโนมัติเวลาแอดมินเปลี่ยนสถานะ
- รองรับ `redirectTo` แบบเต็มรูปแบบหลังล็อกอิน
- Export ใบเสร็จเป็น PDF (ตอนนี้ใช้ print เบราว์เซอร์ตรงๆ)
- ปุ่ม/ไอคอน "ตะกร้า" ที่ค้างอยู่ใน `AdminTopBar.tsx`
- Micro-animation ที่เหลือ: Checkout, Order-History, Admin Dashboard
- แก้ลิงก์ Footer 404 (`/help`, `/help/shipping`, `/help/warranty`, `/about`) — รอผู้ใช้ตัดสินใจว่าจะสร้างหน้าจริงหรือลบลิงก์ออก
- **🆕 Rail.tsx responsive/bottom-nav บนมือถือ** — พบระหว่างงาน responsive รอบนี้ (2026-09-22) ยังไม่ได้แก้ ไม่ใช่บั๊ก แค่ไม่ optimal บนจอเล็ก
- **🆕 Admin pages responsive** — ยังไม่ได้ตรวจเลย (priority ต่ำสุด)

**ค้างไว้/รอทีหลัง**:
1. **โปรแกรมจำลองการจัดโต๊ะ (Phase 2)** — ยังไม่เคยลงรายละเอียดเลย
2. Observability สำหรับ Production (Sentry ฯลฯ) — ผู้ใช้เลือกไม่ทำตอนนี้
3. ข้อมูลทดสอบสังเคราะห์จาก Bruno audit (bruno.testa/testb, address id=3, order id=15) — ยังไม่ได้ถามว่าจะลบหรือเก็บไว้

## สภาพแวดล้อมการทำงานของผู้ใช้
- **เครื่องหลัก**: Windows 11, โฟลเดอร์เชื่อม `C:\Users\ADMIN\OneDrive\Desktop\Desklab project`
- **Desktop Commander MCP ต่ออยู่**: รันคำสั่ง PowerShell ตรง, edit ไฟล์ตรง, delete ไฟล์ตรง, อ่านไฟล์ตรง
- **⚠️ เครื่องนี้ไม่มี Python ติดตั้ง** (ยืนยัน 2026-09-14: รัน `python`/`py` แล้วขึ้น "not recognized"/Microsoft Store alias) — งานที่ต้องใช้สคริปต์ฝั่งเครื่องนี้ให้ใช้ **Node.js แทน** (มีอยู่แล้ว ใช้กับ Next.js อยู่ทุกวัน ตอนนี้เป็น v24.20.0) เช่นสร้าง/รันสคริปต์ `.mjs` ผ่าน `node` ตรงๆ — ถ้าจำเป็นต้องใช้ Python จริงๆ ต้องแจ้งผู้ใช้ให้ติดตั้งก่อน
- **Node.js v24.20.0 มี `node:sqlite` (DatabaseSync) ในตัว** ใช้สร้าง/รันคำสั่ง SQLite ได้โดยไม่ต้องติดตั้ง dependency เพิ่ม (ใช้จริงแล้วตอนสร้าง multi-db/sqlite — ดูหัวข้อด้านล่าง)
- **⚠️ XAMPP MySQL บนเครื่องนี้ต้องแก้ config ก่อนถึง Start ได้ (2026-09-14)**: XAMPP รุ่นที่ติดตั้งไว้ (v3.3.0, compiled เม.ย. 2021, MariaDB 10.4.32) ครัชทันทีตอน Start ("MySQL shutdown unexpectedly", Windows Event Viewer ขึ้น Exception code 0x80000003) — สาเหตุคือ `innodb_use_native_aio` ชนกับ Windows รุ่นนี้ — **แก้แล้วถาวร** โดยเพิ่ม `innodb_use_native_aio=0` ใน `C:\xampp\mysql\bin\my.ini` ใต้ `[mysqld]` — Start สำเร็จแล้วหลังแก้ ไม่ต้องแก้ซ้ำอีกในอนาคต (ยกเว้นถ้ามีการ reinstall/reset XAMPP ใหม่)
- **✅ Vercel deploy สำเร็จแล้ว (2026-09-18)**: ไม่มี Vercel CLI ติดตั้งบนเครื่อง (ยังไม่จำเป็นต้องมี) — ใช้ Vercel Dashboard (เว็บ) เชื่อม GitHub repo + กรอก env vars สำเร็จทั้งหมด — URL จริง: **https://desk-lab-omega.vercel.app/** — ทุก push ขึ้น `main` จะ auto-deploy ให้เอง
- **Supabase MCP**: ต่อ Desk-Lab (`wrokdxuxazwzpttghrko`) — เช็ค `list_projects` ทุกครั้งก่อนรัน SQL จริงเผื่อสลับบัญชี
- **Figma MCP**: บัญชีปัจจุบัน **MisTerToPz.** (poonyapatsudlor@gmail.com) แผน **Starter = 20 tool call/เดือน** (ไม่ใช่ต่อวัน) ใกล้/เกินโควตาได้ง่ายมาก — **ไม่ได้ใช้งานต่อแล้วในตอนนี้เพราะเปลี่ยนมาทำ Admin Dashboard ในโค้ดแทน** (ดูหัวข้อด้านบน) — ถ้าจะกลับมาใช้ Figma อีกในอนาคต ต้องเช็ค quota ก่อนทุกครั้งด้วย `whoami` (ไม่นับ quota) ก่อนเรียก tool อื่น
- **Built-in browser (Claude Browser)**: ใช้ตรวจสอบหน้าเว็บบน localhost:3000 ได้จริงระหว่างทำงาน รวมถึงล็อกอินทดสอบได้ (ใช้บัญชี `bruno.testa`/`bruno.testb` ตั้ง role ชั่วคราวได้เวลาต้องจำลองสถานการณ์แอดมิน โดยต้องเปลี่ยน role กลับเป็น customer ทุกครั้งหลังทดสอบเสร็จ) — ข้อมูลล็อกอินทดสอบเก็บอยู่ที่ `bruno/environments/Local.bru` บนเครื่องผู้ใช้ (`test_email_a`/`test_password_a` = `bruno.testa@desklab.test` / `BrunoTest123!`) — **ใช้ตรวจสอบเว็บ production จริงบน `desk-lab-omega.vercel.app` ได้ด้วย** ต้องขอ site access ก่อนครั้งแรก (`request_access` scope "site") — **resize_window ใช้ทดสอบ responsive ที่ 375/768/1024px ได้จริง (ใช้แล้วรอบ 2026-09-22) — จำเสมอว่าต้อง reset กลับ preset "desktop" หลังทดสอบเสร็จ**
- **⚠️ ข้อควรระวังสำคัญ (2026-09-13)**: บนเครื่องนี้ `next dev` (Windows/Turbopack) สร้าง process ลูกแยกออกจาก process หลักที่ terminal เปิดไว้ — การปิด terminal หรือ kill แค่ process หลัก **ไม่พอ** ที่จะปิด dev server จริง (port 3000 ยังถูกครองอยู่โดย process ลูกที่ยังไม่ตาย) ทุกครั้งที่ต้อง restart dev server เพื่อทดสอบอะไรที่พึ่งพา middleware/proxy หรือ env ใหม่ ต้องเช็ค `Get-NetTCPConnection -LocalPort 3000` หา PID จริงแล้ว `taskkill /PID <pid> /F` ก่อนเปิดใหม่เสมอ ไม่งั้นจะทดสอบกับโค้ดเก่าโดยไม่รู้ตัว
- **⚠️ ข้อควรระวังใหม่ (2026-09-16)**: `motion.xxx` (จาก `motion/react`) ห้ามใช้ตรงๆ ในไฟล์ที่ไม่มี `"use client"` แม้ว่า `motion` component จะถูก import จากแพ็กเกจที่เป็น client module ก็ตาม — เพราะ `motion.xxx` เป็น JavaScript Proxy ที่ execute `createMotionComponent()` ทันทีตอน property access ไม่ใช่ตอน render จึง error ถ้าอ่านจากไฟล์ฝั่งเซิร์ฟเวอร์ล้วน (async Server Component) — ต้องแยก JSX ที่ใช้ `motion.xxx` ไปไว้ในไฟล์ลูกที่มี `"use client"` เสมอ แล้วให้ Server Component import มาใช้แบบส่ง props เท่านั้น (ดูเคสจริงที่หน้า Home ขั้นตอนที่ 5 ด้านล่าง) — **บทเรียนนี้สำคัญกว่า build ผ่านเฉยๆ**: `npm run build` ผ่าน 100% ไม่ได้แปลว่ารันจริงบน dev server จะไม่พัง ต้องเปิดเบราว์เซอร์เช็คหน้าที่แก้จริงทุกครั้งที่ใช้ motion ในไฟล์ใหม่ที่ไม่เคยมี `"use client"` มาก่อน
- **⚠️ ข้อควรระวังใหม่ (2026-09-17)**: บนเครื่องนี้ `npm run build` (production build) กับ `npm run dev` ใช้โฟลเดอร์ `.next` ร่วมกัน — รัน `npm run build` ขณะ `next dev` เดิมยังรันค้างอยู่ (หรือรันสลับกันโดยไม่ restart) อาจทำให้ dev server เดิมเริ่มตอบ 404 ผิดปกติแม้แต่หน้าแรก (`/`) ทั้งที่โค้ด/route ไม่มีปัญหาอะไรเลย (ยืนยันจาก `npm run build` แยกต่างหากที่คอมไพล์ผ่าน 100% ไม่มี error) — วิธีแก้ที่ใช้ได้จริง: หา PID ที่ครอง port 3000 (`netstat -ano | findstr :3000`) `Stop-Process -Id <pid> -Force` แล้ว `npm run dev` ใหม่ทั้งหมด — ไม่ต้องแก้โค้ดใดๆ เพราะไม่ใช่บั๊กของโค้ด
- **GitHub repo**: https://github.com/69319010022-sudo/Desk-Lab (Public, branch `main`), CI/CD ผ่าน GitHub Actions ทำงานอัตโนมัติทุก push/PR เข้า `main`
- **🌐 Production URL**: https://desk-lab-omega.vercel.app/ (Vercel, auto-deploy จาก `main` ทุกครั้งที่ push)

## Phase 2 (หลังร้านค้าเสร็จ)
โปรแกรมจำลองการจัดโต๊ะ — ยังไม่ลงรายละเอียด

---

## 🆕 ระบบ Multi-DB (Primary + 3 Backup) — สรุปย่อ (รายละเอียดเต็มอยู่ในประวัติเวอร์ชันไฟล์นี้)

ระบบ Multi-DB (SQLite/MySQL/MongoDB) ทำครบ 2 รอบแล้ว: รอบแรก (2026-09-14) สร้างตาราง placeholder ครบ 11 ตาราง/collection ทั้ง 3 ฐานข้อมูล (SQLite → MySQL ผ่าน XAMPP → MongoDB ออกแบบใหม่เป็น 7 collections แบบ embed/reference) และรอบสอง (2026-09-14) อัปเดตให้ตรงกับ schema จริงหลัง sync ERD diagram (เพิ่ม `users.avatar_url`/`role`, `orders.cancel_reason`, เพิ่มตาราง/collection `activity_logs` ใหม่ — รวมเป็น 12 ตาราง SQLite/MySQL และ 8 collections MongoDB) — ทุกฐานข้อมูลยังเป็น placeholder เท่านั้น (ไม่มีข้อมูล ไม่เชื่อมกับแอป Next.js ไม่มี sync/failover logic) ไฟล์ schema/สคริปต์ทั้งหมดเก็บไว้ในโฟลเดอร์ `multi-db/` (sqlite/, mysql/, mongodb/) ที่ root โปรเจกต์ — ตัดสินใจคงใช้คอลัมน์ `role` ใน `users` ต่อไป ไม่แยกตาราง `admins` (มีแอดมินแค่บัญชีเดียว ไม่คุ้มความซับซ้อนที่เพิ่มขึ้น)

---

## 🆕 อัปเดตรูปสินค้าจริง + ชื่อ/ราคาจริงจากรูปในโฟลเดอร์ `img/` — สรุปย่อ (2026-09-14, รายละเอียดเต็มอยู่ในประวัติเวอร์ชันไฟล์นี้)

เปลี่ยนสินค้า 10 รายการให้มีชื่อ/ราคา/รูปจริง (เช่น Wooting 60HE+ ฿6,200, Belkin BoostCharge 15W ฿1,790, ModernEgo Sit-Standing Desk Converter ฿7,900 ฯลฯ) — ตัดพื้นหลังรูปด้วย Photoroom (ผู้ใช้ทำเอง คุณภาพดีกว่ารอบแรกที่ลองด้วย OpenCV ใน sandbox มาก) → อัปเดต Supabase (`products` name/slug/description/price) → อัปโหลดรูปขึ้น `public/products/*.png` + อัปเดต `product_images.image_url` → ยืนยันบนเว็บจริงแล้วครบ 10/10 — ระหว่างทางเจอและแก้บั๊กสำคัญ: RLS policy ที่ใช้ `is_admin()` (9 policy จากขั้นตอน Admin Dashboard) ถูกสร้างแบบไม่ระบุ `TO authenticated` ทำให้ default เป็น `TO public` และ error "permission denied for function is_admin" ทันทีที่ผู้เข้าชมไม่ล็อกอิน (anon) เปิดหน้า Shop/Home/Product-detail — บั๊กนี้แฝงมาตั้งแต่ 2026-09-11 ทำให้หน้าเว็บสาธารณะขึ้น "ไม่พบสินค้า" มาตลอด — แก้แล้วด้วย `ALTER POLICY ... TO authenticated;` ทั้ง 9 policy ยืนยันด้วย `SET LOCAL ROLE anon` ตรงๆ ว่า query ผ่านแล้ว

---

## 🆕 Micro-animation สำหรับหน้าเว็บ DeskLab — พักไว้ก่อน (2026-09-18, ทำไปแล้ว 6/9 ขั้นตอน)

ทำไปแล้ว: ขั้นตอนที่ 1-6 (Shop card hover/zoom/tap, Fade-in/Stagger หน้า Shop, Add-to-cart feedback, Product-Detail gallery+form, Home hero+scroll fade-in, Cart fade-in/stagger+micro-interaction) — รายละเอียดเต็มของแต่ละขั้นตอนอยู่ด้านล่างของไฟล์นี้ (หัวข้อ "ขั้นตอนที่ 1" ถึง "ขั้นตอนที่ 6")

**พักไว้ (2026-09-18)**: ผู้ใช้ขอเปลี่ยนไปทำ Deploy ร้านค้าก่อน — ตอนนี้ deploy เสร็จแล้ว (ดูหัวข้อถัดไป) — ขั้นตอนที่เหลือ (Checkout, Order-History, Admin Dashboard) ยังไม่ได้เริ่ม เก็บคิวไว้ทำต่อทีหลังตามลำดับเดิม

---

## 🎉 Deploy ร้านค้าขึ้น Production — สำเร็จสมบูรณ์แล้ว (2026-09-18)

**คำขอผู้ใช้**: "พักการทำAnimationไว้ก่อน ตอนนี้อยากให้ช่วยDeployร้านค้าแล้ว" — ถามคำถามเลือกทางเลือกผ่าน AskUserQuestion แล้วผู้ใช้ยืนยัน:
- **แพลตฟอร์ม: Vercel** (ผู้สร้าง Next.js เอง รองรับ App Router/Server Actions เต็มรูปแบบ, เชื่อม GitHub repo ที่มีอยู่แล้ว `69319010022-sudo/Desk-Lab` แล้ว deploy อัตโนมัติทุกครั้งที่ push, free plan พอสำหรับเริ่มต้น)
- **โดเมน: ใช้โดเมนฟรีของ Vercel ไปก่อน** — ได้ **`desk-lab-omega.vercel.app`**
- **Payment gateway (Opn Payments): คงโหมดทดสอบ/sandbox ไว้ก่อน**

**⚠️ ข้อจำกัดสำคัญด้านความปลอดภัยที่ยึดตลอดกระบวนการ**: Claude ไม่แตะค่า API key/secret key ใดๆ เลย — ผู้ใช้กรอก Environment Variables ทั้ง 5 ตัวเองทั้งหมดในหน้า Vercel Project Settings

**แผนขั้นตอนที่ทำจริงทั้งหมด (ทำทีละขั้นตอน ตามกติกา B) — ครบทั้ง 7 ขั้นตอนแล้ว**: (รายละเอียดเต็มดูในประวัติเวอร์ชันไฟล์นี้) — URL: **https://desk-lab-omega.vercel.app/**

**สิ่งที่ยังไม่ได้ทดสอบบน production**: สมัครสมาชิก/ล็อกอินจริง, เพิ่มสินค้าลงตะกร้าจริง, ขั้นตอน checkout จริง, หน้า Admin Dashboard บน production, Order-History

---

## ✅ แก้รูปสินค้าในหน้า Product-Detail ที่ใหญ่เกินไป — ปิดงานสมบูรณ์ (2026-09-18)

แก้ `src/components/ProductGallery.tsx` เพิ่ม `mx-auto flex w-full max-w-[480px] flex-col gap-3` — commit/push/deploy/ตรวจสอบ production ครบแล้วทั้งหมด รวมอยู่ใน commit `8ab5bcd`

---

## 🆕 แก้หน้าจอโทรศัพท์ที่เละเทะ (หน้า Cart) — เสร็จสมบูรณ์แล้ว commit/push/deploy ครบ + ตรวจสอบ production แล้ว (2026-09-18)

แก้ `TopBar.tsx` (ทุกหน้า), `cart/page.tsx`, `CartAnimatedSections.tsx` (`OrderSummaryPanel` + `CartItemList`) ให้ responsive ที่ breakpoint `lg:` — commit `8ab5bcd` — ตรวจสอบบน production แล้วครบทุกจุด

**พบเพิ่มเติมตอนนั้น (แก้แล้วรอบ 2026-09-21/22)**: หน้า Shop `CartAside.tsx` ล้นขอบจอมือถือ — ดูหัวข้อ "แผน 2 เรื่อง" ด้านบน

---

## 🆕 พบปัญหาใหม่ที่ไม่เกี่ยวข้อง (2026-09-18): ลิงก์ Footer ชี้ไปหน้าที่ยังไม่มีอยู่จริง (404)

Footer คอลัมน์ "ช่วยเหลือ" มีลิงก์ 4 อัน (`/help`, `/help/shipping`, `/help/warranty`, `/about`) ที่ยังไม่มีหน้าจริงรองรับ — **ยังไม่ได้แก้ไข** รอผู้ใช้ตัดสินใจ: (1) สร้างหน้าเนื้อหาจริงทั้ง 4 หน้า หรือ (2) ลบ/ซ่อนลิงก์ออกจาก Footer ชั่วคราว

---

## ✅ ใส่โลโก้จริงของร้าน (Logo Branding) — ปิดงานสมบูรณ์ 100% (2026-09-18/20)

Favicon, กล่องโลโก้ Rail/AdminRail, หัวข้อ Login/Register, Open Graph image — ครบทุกจุด commit `17c17b6` push ขึ้น GitHub แล้ว

---

## ✅ แก้ป้ายไอคอนหมวดหมู่หน้าแรก (Popular Categories) — ปิดงานสมบูรณ์ 100% (2026-09-20)

แทนที่ `{cat.name.charAt(0)}` ด้วยไอคอน SVG จริง 8 อัน ใน `HomeAnimatedSections.tsx` — commit `fb992a1` push ขึ้น GitHub แล้ว

---

## ✅ แผน 2 เรื่อง: (1) เพิ่มความเร็วโหลดหน้า (2) แก้ Responsive มือถือ/ไอแพดให้ครบทุกหน้า — ปิดงานสมบูรณ์ 100% (2026-09-21/22)

ดูสรุปผลลัพธ์เต็มในหัวข้อ "🔜 ขั้นต่อไปที่แนะนำ" ด้านบนสุด (ย้ายไปรวมไว้ที่นั่นเพื่อไม่ให้ซ้ำซ้อน) — commit `b49064e` (ความเร็ว) + `e0d9ea2` (responsive) push ขึ้น GitHub แล้วทั้งคู่ ยังไม่ได้ตรวจสอบผลบน production หลัง deploy รอบนี้
