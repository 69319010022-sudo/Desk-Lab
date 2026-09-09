Desklab Project — แผนงานและการตัดสินใจ

ภาพรวมโปรเจกต์

ร้านขายของแต่งโต๊ะคอมออนไลน์ + โปรแกรมจำลองการจัดโต๊ะในเว็บของร้าน ทำเป็น 2 เฟสใหญ่: (1) ร้านค้าออนไลน์ก่อน (2) โปรแกรมจำลองการจัดโต๊ะทีหลัง

ผู้ใช้ต้องการเรียนรู้ทีละขั้นตอน (step by step) ไม่ใช่แค่รับโค้ดสำเร็จรูป — ขอให้ทำทีละส่วนย่อย ไม่ทำรวดเดียวทั้งหมด

การตัดสินใจที่ยืนยันแล้ว
Frontend/Framework: Next.js (App Router) + React + TypeScript + Tailwind CSS v4
ระบบลูกค้า: ระบบสมัครสมาชิก/ล็อกอินเต็มรูปแบบ (ไม่ใช่ guest checkout) — ตะกร้าจึงผูกกับผู้ใช้ที่ล็อกอินเท่านั้น ไม่มีตะกร้าแบบ guest
Database: Supabase (Postgres), project "Desk-Lab" (project_id: wrokdxuxazwzpttghrko, region ap-northeast-1) — นี่คือ project_id ที่ถูกต้องจริง (ยืนยันจาก .env.local บนเครื่องผู้ใช้) ดูหมายเหตุสำคัญเรื่อง MCP ด้านล่าง
Schema: ยืนยันใช้เวอร์ชันใน [[desklab-schema.md]]
Figma file จริงที่ผู้ใช้ทำ: "Desklap-wireframe" — https://www.figma.com/design/B0bJNlYizSiR0yHWcmOzt3/Desklap-wireframe
ตารางทั้ง 11 ตารางสร้างสำเร็จแล้วตาม desklab_supabase_schema.sql
Supabase Auth: ปิด "Confirm email" ไว้ระหว่างพัฒนา (ผู้ใช้ตัดสินใจแล้ว) — สมัครสมาชิกแล้วล็อกอินได้ทันที ไม่ต้องยืนยันอีเมล — ต้องกลับมาเปิดใหม่ + ตั้งค่า SMTP ตอนพร้อมเปิดร้านจริง
เครื่องมือทดสอบ API: ผู้ใช้เลือก Bruno (โปรแกรมทดสอบ API แบบเดียวกับ Postman ลงบนเครื่องผู้ใช้เอง) ไว้ใช้ตอนทดสอบ/ตรวจสอบ Supabase REST API ระหว่างพัฒนา — ยังไม่เริ่มใช้ตอนนี้ ผู้ใช้แค่ตัดสินใจไว้ล่วงหน้า
Payment gateway: ยืนยันใช้ Opn Payments (เดิมชื่อ Omise) โหมดทดสอบ/sandbox — พร้อมเพย์, บัตรเครดิต/เดบิต, และ COD ครบทั้ง 3 วิธีแล้ว ทดสอบผ่านทั้งหมด (ดูหัวข้อ "✅ ข้อ 8: Payment gateway" ด้านล่าง) — ข้อ 8 เสร็จสมบูรณ์แล้ว
✅ RLS — เปิดใช้งานสำเร็จแล้ว

รัน desklab_rls_policies.sql ใน Supabase SQL Editor สำเร็จแล้ว (ผลลัพธ์ "Success. No rows returned") เปิด Row Level Security ครบทั้ง 11 ตาราง พร้อม policy ตามแนวคิด:

ตารางแคตตาล็อกสาธารณะ (categories, products [เฉพาะ is_active=true], product_images, reviews) — ให้ anon+authenticated อ่านได้หมด แต่เขียนไม่ได้เลยแม้จะล็อกอินอยู่ (ไม่มี policy insert/update ให้ authenticated ทั่วไป) เพราะเป็นข้อมูลร้านที่ทุกคนควรเห็นได้แม้ยังไม่ล็อกอิน แต่แก้ราคา/สต็อกเองไม่ได้ (ข้อยกเว้น: reviews มี insert/update/delete ให้เจ้าของรีวิวเองด้วย แต่ยังไม่มีหน้าเขียนรีวิวจริงในแอป)
ตารางข้อมูลส่วนตัว (users, addresses, carts, cart_items, orders, order_items) — เห็น/แก้ได้เฉพาะแถวของ auth.uid() ตัวเอง; cart_items/order_items ไม่มี user_id ตรงๆ เลยเช็คผ่าน EXISTS subquery ไปที่ carts/orders แม่ของมัน; ตาราง addresses ใช้ policy เดี่ยว addresses_all_own (cmd=ALL, qual/with_check = auth.uid() = user_id)
orders: orders_insert_own (insert ออเดอร์ตัวเองได้ตอน checkout), orders_select_own, และ orders_update_own_cancel (UPDATE ที่จำกัดมาก: อนุญาตเฉพาะเปลี่ยนจากสถานะ pending → cancelled ของออเดอร์ตัวเองเท่านั้น — RLS ไม่จำกัดเป็นรายคอลัมน์ แค่จำกัดที่ค่าของแถว จึงอัปเดต cancel_reason พร้อมกันได้) — ไม่มี policy ให้ authenticated ทั่วไปเปลี่ยนสถานะเป็น paid/processing/shipped/delivered เอง ตั้งใจไว้แบบนั้น เพื่อบังคับให้การยืนยันชำระเงินสำเร็จต้องผ่าน service role เท่านั้น (ใช้งานจริงแล้ว — ดูหัวข้อ Opn Payments ด้านล่าง) — ข้อสำคัญ: เพราะ policy นี้ล็อกไว้เฉพาะ pending→cancelled ออเดอร์ COD ที่เริ่มต้นที่สถานะ "processing" เลย (ดูหัวข้อ COD ด้านล่าง) ลูกค้าจะกดยกเลิกเองไม่ได้อีกต่อไป (ปุ่มยกเลิกฝั่ง UI ก็ซ่อนไว้เมื่อไม่ใช่ pending อยู่แล้ว) — เป็นผลข้างเคียงที่ตั้งใจปล่อยไว้ตามที่ผู้ใช้ขอ ยังไม่ได้เพิ่มทางยกเลิกอื่นให้ COD
order_items: order_items_select_via_own_order / order_items_insert_via_own_order เช็คผ่าน EXISTS ไปที่ orders แม่ (เจ้าของออเดอร์เท่านั้นเห็น/insert ได้)
cart_items/carts: cart_items_all_via_own_cart (ALL, เช็คผ่าน EXISTS ไปที่ carts แม่), carts_all_own (ALL, auth.uid() = user_id)
products: products_select_active_public (แค่ is_active=true อ่านได้ — สำคัญตอนดึง products แบบ nested embed จากตารางอื่น: แถวที่ is_active=false จะได้ null กลับมาจาก RLS ไม่ error)
payments: payments_select_via_own_order — ผู้ใช้ "อ่านได้อย่างเดียว" ของออเดอร์ตัวเอง ไม่มี policy insert/update ให้ authenticated เลย (ตั้งใจล็อกไว้กันลูกค้าปลอมสถานะจ่ายเงินเอง) — เขียนได้เฉพาะผ่าน service role client เท่านั้น (ใช้งานจริงแล้วใน src/lib/actions/orders.ts และ src/lib/actions/payments.ts)
reviews: อ่านได้ทุกคน เขียน/แก้/ลบได้เฉพาะรีวิวของตัวเอง
users มี policy insert/select/update ของแถวตัวเองครบ (users_insert_own, users_select_own, users_update_own ใช้ auth.uid() = id) — ไม่มี delete policy ให้ผู้ใช้ทั่วไป หมายเหตุ: รอบแรกที่รันเจอ error "policy already exists" (รันซ้ำจากที่เคยรันบางส่วนไปแล้ว) แก้โดยเพิ่ม DROP POLICY IF EXISTS นำหน้าทุก policy ในไฟล์ ทำให้รันซ้ำได้ปลอดภัย รอบสองรันผ่านสำเร็จ
✅ Frontend เชื่อม Supabase จริงแล้ว (แคตตาล็อกสินค้า)
สร้าง src/lib/supabase/{client,server,middleware}.ts ตามแพทเทิร์นทางการของ @supabase/ssr (แยก browser client / server client แบบ cookie-based) + middleware.ts ที่ root สำหรับ refresh session token ทุก request
สร้าง src/lib/data/catalog.ts — เลเยอร์ดึงข้อมูลจริงจาก Supabase (getCategories, getProducts, getProductBySlug, getRelatedProducts, getReviewsForProduct) คืนค่าเป็น type เดิม (Category/Product/Review) เพื่อไม่ต้องแก้ component เดิม, ทุกฟังก์ชัน graceful-degrade (คืนค่าว่างไม่ throw ถ้าต่อ Supabase ไม่ได้) ยกเว้น error ภายในของ Next.js เอง (DYNAMIC_SERVER_USAGE) ที่ต้อง rethrow ต่อ ห้ามกลืน
หน้า Home / Shop / Product-detail เปลี่ยนเป็น Server Component แบบ async ดึงข้อมูลจริงแล้ว (ลบ generateStaticParams ของหน้า product ออก เพราะสินค้าต้อง dynamic ตามฐานข้อมูล)
หมายเหตุ: reviews ยังโชว์ชื่อผู้รีวิวจริงไม่ได้ (RLS ตาราง users อ่านได้เฉพาะแถวตัวเอง) ใช้ป้าย "ลูกค้า DeskLab" ไปก่อน — ของจริงต้องรอระบบเขียนรีวิว (แผน: เพิ่มคอลัมน์ author_name ตอน insert)
แก้บั๊ก path: ตอนแรกไฟล์ Supabase setup ถูกคอมมิตไปผิด path ที่เครื่องผู้ใช้ (เพราะ zip แตกไฟล์แบบแฟลตไม่มีโฟลเดอร์ย่อย) ทำให้ build error เพียบ — แก้แล้วโดยคอมมิตไฟล์ใหม่ไปที่ path ที่ถูกต้อง (C:\Users\ADMIN\OneDrive\Desktop\Desklab project\) และให้ผู้ใช้ลบ node_modules + package-lock.json เก่าแล้วติดตั้งใหม่
✅ ข้อมูลสินค้าจริง (seed data) — ใส่แล้ว

เดิม products/categories ในฐานข้อมูลจริงว่างเปล่า (มีแค่โครงตาราง) ทำให้หน้า Shop โชว์สินค้าไม่ขึ้น (ของ demo 8 ชิ้นเป็นแค่ mock ใน demo-data.ts ไม่เคยอยู่ใน Supabase) — แก้แล้วโดยรัน INSERT ใส่ 5 categories + 8 products (ชุดเดียวกับที่เคยเห็นตอน demo) ตรงเข้าไปใน Supabase ผ่าน MCP tool โดยตรง ยืนยันแล้วว่าเว็บโชว์สินค้าขึ้นถูกต้อง — ยังไม่มีรูปสินค้าจริง (product_images ว่างเปล่า 0 แถว) หน้าเว็บใช้ไอคอนวางแทนรูปทั้งหมด

⚠️ Supabase MCP เชื่อมกับ Cowork — เจอปัญหาบัญชีผิด เจอแล้วแก้แล้ว (2026-09-02)

ระหว่างเซสชันนี้ MCP เคยต่อผิดบัญชี/องค์กร (list_projects คืนแค่ "kantapong004's Project" project_id mmoozdtcxopnznnfjfyr — ไม่ใช่โปรเจกต์จริงของแอป, schema ไม่ตรง ไม่มีตาราง public.users) — ลอง apply_migration ไปโปรเจกต์ผิดนี้ตอนทำอัปโหลดรูปโปรไฟล์ error ตั้งแต่บรรทัดแรก rollback หมดอัตโนมัติ ไม่มีผลข้างเคียง

แก้แล้ว: ผู้ใช้ disconnect + reconnect Supabase connector ใหม่ (เลือกบัญชี/องค์กรที่ถูกต้องตอน login) — list_projects คืน "Desk-Lab" (wrokdxuxazwzpttghrko) ถูกต้องแล้ว ยืนยันซ้ำด้วย list_tables ตรงกับข้อมูลจริงที่ผู้ใช้เคยทดสอบมา (users 2 แถว, orders 9 แถว ฯลฯ)
ข้อควรระวังสำหรับเซสชันถัดไป: ก่อนใช้ mcp__Supabase__* tools ใดๆ ที่แก้ข้อมูลจริง (apply_migration/execute_sql) ต้องเช็ค project_id จาก list_projects ให้ตรงกับ wrokdxuxazwzpttghrko ก่อนเสมอ ถ้าไม่ตรง/ไม่เจอ ห้ามรัน SQL ผ่าน MCP เด็ดขาด — ให้ผู้ใช้ reconnect connector ใหม่ (เลือกบัญชีถูกต้อง) หรือส่ง SQL เป็นไฟล์ให้รันเองผ่าน Dashboard > SQL Editor แทน
นี่อาจเป็นสาเหตุจริงของ error "You do not have permission to perform this action" ที่เจอเป็นระยะๆ ในเซสชันก่อนๆ ด้วย — ยังไม่ยืนยัน 100%
ข้อจำกัดใหม่ที่เจอ: apply_migration/execute_sql ผ่าน MCP แก้ตาราง storage.objects โดยตรงไม่ได้เต็มที่ — รัน ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY ผ่าน MCP แล้ว error must be owner of table objects (role ที่ MCP ใช้ไม่ใช่เจ้าของตาราง) — วิธีแก้: ข้าม statement นั้นไปเลย (RLS เปิดอยู่แล้วโดยดีฟอลต์ของ Supabase) ส่วน CREATE POLICY on storage.objects ยังรันผ่าน MCP ได้ปกติ (ทดสอบแล้วสำเร็จ) — เจอเฉพาะ ALTER TABLE ... ENABLE/DISABLE ROW LEVEL SECURITY ที่ติด
ข้อจำกัดเดิมยังอยู่: ไม่มี tool สำหรับแก้ Auth config (เช่น เปิด/ปิด Confirm email, เพิ่ม Redirect URL) ต้องให้ผู้ใช้กดเองใน Dashboard > Authentication เสมอ
✅ Auth จริงผ่าน Supabase Auth — เสร็จแล้ว และผู้ใช้ทดสอบผ่านแล้ว (สมัคร/ล็อกอิน/ล็อกเอาต์ใช้งานได้จริง)
DB migration auto_create_public_user_on_signup: สร้าง trigger บน auth.users (AFTER INSERT) ที่เรียกฟังก์ชัน handle_new_auth_user() (SECURITY DEFINER) เพื่อสร้างแถวคู่กันใน public.users อัตโนมัติทุกครั้งที่มีคนสมัครสมาชิกใหม่ — อ่าน name/phone จาก raw_user_meta_data ที่ส่งมาตอน signUp()
Migration ที่สอง restrict_handle_new_auth_user_execute: revoke EXECUTE ของฟังก์ชัน trigger จาก anon/authenticated/public ตาม Supabase security advisor — ตรวจสอบแล้วไม่มี security warning เหลือ
src/lib/data/auth.ts (getCurrentUser — ตอนนี้คืน avatarUrl ด้วยแล้ว ดูหัวข้ออัปโหลดรูปโปรไฟล์ด้านล่าง), src/lib/actions/auth.ts (signInAction/signUpAction/signOutAction/updatePasswordAction/confirmPasswordResetAction), src/lib/actions/profile.ts (updateProfileAction, uploadAvatarAction) — ใช้ useActionState ฝั่ง Client Component
หน้า /login, /register, ปุ่มออกจากระบบใน Navbar/AccountSidebar, guard ที่ (auth)/layout.tsx และ (site)/account/layout.tsx, หน้า /account/profile อ่าน/บันทึกข้อมูลจริง — ทั้งหมดต่อกับ Supabase Auth จริงแล้ว
ระหว่างทดสอบเจอ 2 อย่าง: (1) โปรเจกต์ Supabase เปิด "Confirm email" ไว้เป็นค่าเริ่มต้น ทำให้สมัครแล้วล็อกอินไม่ได้จนกว่าจะยืนยันอีเมล — ผู้ใช้ตัดสินใจปิดฟีเจอร์นี้เองใน Dashboard ระหว่างพัฒนา (ดู "การตัดสินใจที่ยืนยันแล้ว" ด้านบน) (2) เคสถัดมาที่ล็อกอินไม่ได้เป็นแค่พิมพ์รหัสผ่านไม่ตรงกับตอนสมัคร (ตรวจสอบผ่าน SQL แล้วว่าบัญชี confirm/มีรหัสผ่านถูกต้องตามระบบ ไม่ใช่บั๊ก)
🚧 หน้า "ลืมรหัสผ่าน" จริง — พักไว้ก่อนตามคำขอผู้ใช้ (ยังไม่เสร็จ ยังไม่ได้สืบต่อ)

ใช้ Supabase Auth's password-recovery flow มาตรฐาน (PKCE), ไม่ใช่ระบบแยกของเราเอง

สาเหตุที่แท้จริงของบั๊ก (ยืนยันแล้วจากการอ่าน source code ของ @supabase/ssr โดยตรง ไม่ใช่แค่เดา):

ทั้ง createServerClient และ createBrowserClient ของ @supabase/ssr hard-code flowType: "pkce" ไว้เสมอ (override ค่าที่ส่งเข้าไปเอง) — เลือกใช้ implicit flow ผ่าน option ไม่ได้จริงๆ
createServerClient เขียนคุกกี้ (setAll) เฉพาะตอนอยู่ใน onAuthStateChange listener ที่ดักเฉพาะ event บางแบบเท่านั้น (SIGNED_IN/TOKEN_REFRESHED/USER_UPDATED/PASSWORD_RECOVERY/SIGNED_OUT/MFA_CHALLENGE_VERIFIED) — การเรียก resetPasswordForEmail() ฝั่งเซิร์ฟเวอร์ไม่ยิง event เหล่านี้เลย (ยังไม่มี session) ทำให้ code_verifier ที่ควรถูกเก็บเป็นคุกกี้ไม่ถูกเขียนจริง (ค้างอยู่แค่ในหน่วยความจำชั่วคราว) — นี่คือสาเหตุจริงของ error "PKCE code verifier not found in storage"
createBrowserClient เขียนคุกกี้ผ่าน document.cookie ทันทีไม่มีการดักด้วย event แบบนั้น

ความพยายามแก้ทั้งหมด 3 รอบ:

เปลี่ยนไปใช้ verifyOtp + token_hash แทน code/exchangeCodeForSession — ติดปัญหา: การแก้ email template ของ Supabase (เพื่อให้ลิงก์ส่ง token_hash แทน code) ต้องตั้งค่า custom SMTP ก่อน (ยืนยันจากสกรีนช็อต Dashboard) — โปรเจกต์นี้ยังไม่ได้ตั้ง SMTP เอง จึงทำต่อไม่ได้ ยกเลิกแนวทางนี้
ลอง flowType: "implicit" — ไม่ได้ผล เพราะ hard-code ไว้ใน @supabase/ssr ตามที่อธิบายด้านบน (พิสูจน์แล้วว่า URL หลัง redirect ยังมี ?code=... เหมือนเดิมทุกอย่าง)
ย้ายการเรียก resetPasswordForEmail() จาก Server Action ไปเรียกฝั่ง client ตรงๆ ใน ForgotPasswordForm.tsx แทน (เพราะ browser client เขียนคุกกี้ทันทีไม่ติด event-gating) — เก็บ exchangeCodeForSession ไว้ฝั่งเซิร์ฟเวอร์เหมือนเดิม (เพราะเรียกแล้วยิง SIGNED_IN จริง ใช้งานได้) — ทฤษฎีถูกต้อง แต่ผู้ใช้ทดสอบแล้วรายงานว่า "ยังเหมือนเดิม" (ยังเจอปัญหาเดิม) — ยังไม่ได้สืบสาเหตุต่อว่าทำไมถึงยังไม่หายหลังแก้จุดนี้แล้ว

สถานะโค้ดปัจจุบัน: กลับไปที่สถาปัตยกรรมทำงานได้ทางกลไก (mechanically-clean) แบบ code + exchangeCodeForSession แล้ว — ไม่ได้ทิ้งโค้ด 3 แนวทางค้างปนกัน — แต่ resetPasswordForEmail() ยังเรียกฝั่ง client (การแก้ข้อ 3 ด้านบน) ค้างไว้อยู่ (ยังไม่ยืนยันว่าใช้งานได้จริง)

ตามคำขอผู้ใช้ ("ยังเหมือนเดิม ผมว่าเราควรข้ามไปทำอย่างอื่นก่อนนะ") — พักฟีเจอร์นี้ไว้ก่อน ไม่สืบต่อจนกว่าผู้ใช้จะขอให้กลับมาทำต่อเอง

⚠️ Redirect URL: ผู้ใช้ยืนยันแล้วว่าเพิ่ม http://localhost:3000/auth/confirm ใน Supabase Dashboard > Authentication > URL Configuration > Redirect URLs เรียบร้อยแล้ว — ไม่ใช่สาเหตุของปัญหา

หมายเหตุเรื่องอีเมล: โปรเจกต์นี้ยังใช้ระบบส่งอีเมลเริ่มต้นของ Supabase (ยังไม่ได้ตั้งค่า SMTP เอง) ซึ่งมี rate limit ค่อนข้างต่ำ (ไม่กี่ฉบับต่อชั่วโมง) และอีเมลจะมาจาก noreply@mail.app.supabase.io — ใช้ทดสอบได้แต่ก่อนเปิดร้านจริงควรตั้งค่า SMTP เอง (การตั้ง SMTP เองน่าจะแก้ปัญหานี้ไปด้วยพร้อมกัน เพราะจะปลดล็อกการแก้ email template ได้ด้วย)

ไฟล์ที่เกี่ยวข้อง: src/lib/actions/auth.ts (confirmPasswordResetAction), src/app/(password-reset)/forgot-password/ForgotPasswordForm.tsx (เรียก resetPasswordForEmail ฝั่ง client), src/app/auth/confirm/route.ts, src/app/(password-reset)/auth/confirm-recovery/{page.tsx,ConfirmRecoveryForm.tsx}, src/app/(password-reset)/reset-password/page.tsx, src/lib/supabase/{client,server}.ts ไฟล์ขยะที่ลบไปแล้ว: ResetPasswordGate.tsx (โค้ดทดลอง implicit-flow ที่ไม่ได้ใช้แล้ว — ลบออกจากทั้ง cloud mirror และเครื่องผู้ใช้แล้วในรอบตรวจสอบล่าสุด เพราะ lint ฟ้อง error react-hooks/set-state-in-effect จากไฟล์นี้)

✅ อัปโหลดรูปโปรไฟล์ — เสร็จสมบูรณ์ทั้งโค้ดและฐานข้อมูล พร้อมทดสอบจริงได้เลย

สถาปัตยกรรม:

Storage bucket ใหม่ avatars (public อ่านได้ทุกคน — รูปโปรไฟล์ไม่ใช่ข้อมูลลับ), policy insert/update/delete จำกัดเฉพาะไฟล์ในโฟลเดอร์ของ user id ตัวเอง (storage.foldername(name)[1] = auth.uid()::text)
คอลัมน์ใหม่ public.users.avatar_url (text, nullable)
src/lib/actions/profile.ts — uploadAvatarAction: รับไฟล์จาก FormData, ตรวจชนิดไฟล์ (ต้องขึ้นต้น image/) + ขนาด (≤2MB) → อัปโหลดที่ path <user.id>/avatar.<นามสกุล> เดียวเสมอ (upsert: true ทับไฟล์เดิม ไม่สะสมขยะ) → ได้ public URL แปะ ?v=timestamp กัน browser cache รูปเก่า → บันทึกลง users.avatar_url
src/lib/data/auth.ts (getCurrentUser) เพิ่ม field avatarUrl ใน CurrentUser type
src/app/(site)/account/profile/ProfileForm.tsx — เพิ่มฟอร์มอัปโหลดอิสระอีกฟอร์ม (คนละฟอร์มกับฟอร์มแก้ชื่อ/เบอร์) ใช้ useActionState ที่สอง, ปุ่ม "เปลี่ยนรูป" เป็น label ครอบ hidden file input, เลือกไฟล์แล้ว auto-submit ทันทีผ่าน requestSubmit() — โชว์รูปจริงถ้ามี avatarUrl ไม่งั้นโชว์ไอคอน placeholder
SQL migration รันสำเร็จแล้วจริงบนโปรเจกต์ Desk-Lab (2026-09-02): หลัง reconnect MCP ให้ต่อบัญชีถูกต้องแล้ว (ดูหัวข้อ MCP ด้านบน) รัน apply_migration ตรงผ่าน MCP สำเร็จ — คอลัมน์ avatar_url, bucket avatars (public), policy 4 ตัวครบ ยืนยันด้วย execute_sql แล้วว่ามีจริงในฐานข้อมูล — ไฟล์ desklab_avatar_migration.sql ที่ root โฟลเดอร์โปรเจกต์ยังเก็บไว้เป็นเอกสารอ้างอิง (เนื้อหาเทียบเท่ากับที่รันไปแล้ว ไม่ต้องรันซ้ำอีก)
ตรวจสอบแล้ว (2026-09-02): ไฟล์บนเครื่องผู้ใช้ตรงกับ cloud mirror ทุกไฟล์ (profile.ts), npm run build และ npm run lint ผ่านทั้งคู่ (lint เหลือแค่ 2 error เดิมที่ไม่เกี่ยวข้อง — AddAddressForm.tsx/AddressCard.tsx set-state-in-effect — กับ warning <img> ที่คาดไว้แล้ว) — โค้ด+ฐานข้อมูลพร้อมทดสอบ 100% ไม่ต้องรออะไรอีกแล้ว รอผู้ใช้กดทดสอบเท่านั้น
✅ ตัดสต็อกสินค้าจริงตอนสั่งซื้อ (item 4) — เขียนโค้ด+รัน migration เสร็จแล้ว รอผู้ใช้ทดสอบ

สถาปัตยกรรม: Postgres function public.decrement_order_stock(p_order_id bigint) (SECURITY DEFINER, set search_path = public) — เพราะ RLS ของ products ให้ authenticated อ่านได้อย่างเดียว เขียนไม่ได้ (ตั้งใจกันผู้ใช้แก้ราคา/สต็อกเอง)

เช็คก่อนว่า order นั้นเป็นของ auth.uid() ที่เรียกจริง (SECURITY DEFINER ข้าม RLS หมด ต้องเช็คสิทธิ์เองในฟังก์ชัน กันคนอื่นสั่งตัดสต็อกของออเดอร์ที่ไม่ใช่ของตัวเอง)
loop ตัด stock_quantity ทีละแถวของ order_items ด้วย UPDATE ... WHERE stock_quantity >= quantity ในประโยคเดียว (atomic ต่อแถว) ถ้า row_count = 0 แปลว่าสต็อกไม่พอ (หรือมีคนสั่งพร้อมกันแซงไปก่อน) → raise exception ทันที
revoke ... from public/from anon, grant execute ... to authenticated เท่านั้น — ตรวจสอบผ่าน pg_proc.proacl แล้วว่ามีแค่ postgres/authenticated/service_role เข้าถึงได้ ไม่มี anon (แก้ WARN "anon_security_definer_function_executable" จาก security advisor ที่เจอตอนรันรอบแรกแล้ว — WARN "authenticated_security_definer_function_executable" ที่เหลือเป็นแบบตั้งใจ เหมือน pattern เดียวกับ handle_new_auth_user ตอนทำ auth)
src/lib/actions/orders.ts (createOrderAction): เรียก supabase.rpc("decrement_order_stock", { p_order_id: order.id }) ทันทีหลัง insert order_items สำเร็จ — ถ้า error (สต็อกไม่พอ) → ลบ order_items + orders ที่สร้างไปแล้วทิ้ง (rollback เหมือน pattern เดิมที่ใช้ตอน itemsError/บัตรล้มเหลว) แล้วคืน error ให้ผู้ใช้ปรับจำนวนในตะกร้าใหม่
migration รันสำเร็จแล้วจริงบนโปรเจกต์ Desk-Lab ผ่าน MCP (2026-09-03) — ไฟล์ desklab_stock_decrement_migration.sql ที่ root โฟลเดอร์เก็บไว้เป็นเอกสารอ้างอิง (ไม่ต้องรันซ้ำ)
ตรวจสอบแล้ว: npm run build/npm run lint ผ่านทั้งคู่ (เหลือแค่ 2 error เดิมไม่เกี่ยวข้อง)
ยังไม่ได้ทดสอบจริงปลายทาง: ต้องลองสั่งซื้อ 1 ออเดอร์จริง แล้วเช็คว่า products.stock_quantity ของสินค้าที่สั่งลดลงตามจำนวนที่สั่งจริงไหม (เช็คได้จาก Supabase Table Editor หรือถามผมให้ query ให้)
✅ ตะกร้าสินค้าจริง (ส่วนที่ 1 ของข้อ 7) — เสร็จแล้ว ผู้ใช้ทดสอบผ่านแล้ว

ผู้ใช้ขอให้แบ่งข้อ 7 (ตะกร้า/ที่อยู่/ประวัติคำสั่งซื้อ) ทำทีละส่วน ไม่ทำรวดเดียว — เริ่มจากตะกร้าก่อน:

src/lib/data/cart.ts — getCart() อ่านตะกร้า+รายการสินค้าจริงของผู้ใช้ปัจจุบัน (join คาร์ทกับ products), getCartItemCount() เวอร์ชันเบาไว้โชว์เลขที่ Navbar
src/lib/actions/cart.ts — getOrCreateCartId() (helper ใช้ร่วมกับ reorderAction ด้วย), addToCart (สำหรับ <form action> ธรรมดา ใช้ใน ProductCard, คืนค่า void), addToCartAction (คู่กับ useActionState ใช้ในหน้ารายละเอียดสินค้า โชว์ error/loading ได้), updateCartItemQuantity, removeCartItem — ตาราง carts สร้างแบบ lazy (สร้างแถวแรกตอนกด "เพิ่มลงตะกร้า" ครั้งแรก ไม่ได้สร้างตอนสมัครสมาชิกเหมือน public.users)
ยังไม่ล็อกอินแล้วกด "เพิ่มลงตะกร้า" จะถูก redirect ไป /login ทันที (ระบบนี้ไม่มีตะกร้าแบบ guest ตามการตัดสินใจที่ยืนยันไว้)
ProductCard.tsx ปุ่ม "เพิ่มลงตะกร้า" ทำงานจริงแล้ว (เพิ่มจำนวน 1 ชิ้น), หน้ารายละเอียดสินค้ามี AddToCartForm.tsx (client component ใหม่) ที่รวม QuantityStepper + ปุ่มเพิ่มลงตะกร้าเข้าด้วยกัน โชว์ error/success ได้ — ปุ่ม "ซื้อทันที" ยัง disabled ไว้ก่อน (รอเชื่อมระบบชำระเงิน)
QuantityStepper.tsx เพิ่ม prop onChange (optional, backward-compatible) ให้ parent component อ่านค่าจำนวนได้
หน้า /cart เขียนใหม่เป็น Server Component ดึงข้อมูลจริงจาก Supabase, ปุ่ม +/−/ลบ เป็น <form> ธรรมดาเรียก Server Action ตรงๆ ไม่ต้องมี client state เลย (คำนวณจำนวนใหม่ฝั่งเซิร์ฟเวอร์ตอน render แล้วส่งมาใน hidden input)
(site)/layout.tsx ดึง getCartItemCount() จริงแล้ว ส่งเข้า Navbar แทนเลข 0 ที่ hardcode ไว้
ผู้ใช้ทดสอบจริงแล้ว (สกรีนช็อตหน้าตะกร้ามีสินค้าจริง คำนวณยอดถูกต้อง, เลขที่ badge ตรง) — ยืนยันว่าทำงานถูกต้อง
✅ ที่อยู่จัดส่งจริง (ส่วนที่ 2 ของข้อ 7) — เสร็จแล้ว ผู้ใช้ทดสอบผ่านแล้ว
src/lib/data/addresses.ts — getAddresses() อ่านที่อยู่ทั้งหมดของผู้ใช้ปัจจุบันจาก Supabase (เรียง default ก่อน แล้วตาม id)
src/lib/actions/addresses.ts — addAddressAction/updateAddressAction/deleteAddressAction/setDefaultAddressAction
หน้า /account/addresses + /checkout ส่วนเลือกที่อยู่ ดึงที่อยู่จริงมาแสดง
ผู้ใช้ทดสอบจริงแล้ว (สกรีนช็อตเพิ่ม 2 ที่อยู่ "บ้าน"/"ที่ทำงาน" สำเร็จ ตรงกับ Supabase Table Editor เป๊ะ) — ยืนยันว่าทำงานถูกต้อง
✅ สร้างคำสั่งซื้อจริงตอน checkout (ส่วนที่ 3 ของข้อ 7) — เสร็จแล้ว ผู้ใช้ทดสอบผ่านแล้ว

ข้อ 7 ครบทั้ง 3 ส่วนแล้วและผู้ใช้ทดสอบผ่านครบทุกส่วนแล้ว (ตะกร้า/ที่อยู่/สร้างคำสั่งซื้อจริง):

src/lib/data/orders.ts — getOrders() อ่านประวัติคำสั่งซื้อจริงของผู้ใช้ปัจจุบัน, getOrderById() (ผู้ใช้เพิ่มเองทีหลังสำหรับหน้ารายละเอียด)
src/lib/actions/orders.ts — createOrderAction: ตรวจที่อยู่เป็นของผู้ใช้จริง → เช็คตะกร้าไม่ว่าง+สต็อกพอ → insert orders → insert order_items → insert payments → ลบ cart_items (เคลียร์ตะกร้า) → redirect ตามวิธีชำระเงิน
ตัดสต็อกสินค้าจริง (products.stock_quantity) — เสร็จแล้ว (2026-09-03) ดูหัวข้อ "ตัดสต็อกสินค้าจริงตอนสั่งซื้อ" ด้านล่าง (item 4)
ผู้ใช้ทดสอบจริงแล้ว (สกรีนช็อตยืนยัน: สร้างคำสั่งซื้อสำเร็จ, order_items ตรงกับสินค้าที่สั่งจริง) — ข้อ 7 เสร็จสมบูรณ์ทั้งหมดแล้ว
✅ ยกเลิกคำสั่งซื้อ + เหตุผลการยกเลิก + สั่งซื้อใหม่อีกครั้ง — ผู้ใช้สร้างเองทั้งระบบ ตรวจสอบแล้วถูกต้องครบวงจร

ผู้ใช้สร้างฟีเจอร์นี้เองทั้งหมด (Frontend + server actions + คอลัมน์ฐานข้อมูล) ไม่ใช่ Claude ทำ — Claude ตรวจสอบให้เท่านั้น:

ไม่ลบข้อมูลเวลายกเลิก — เปลี่ยน order_status เป็น "cancelled" เก็บประวัติไว้
โมดัลเลือกเหตุผลการยกเลิก: CancelOrderButton.tsx เปิดโมดัลให้เลือกเหตุผลจากลิสต์ (+ "อื่นๆ" กรอกเอง) แล้วส่งไป cancelOrderAction(orderId, reason) → อัปเดต orders.order_status='cancelled' พร้อม orders.cancel_reason=reason
คอลัมน์ orders.cancel_reason (text, nullable) มีอยู่จริงในฐานข้อมูลแล้ว ตรงกับที่โค้ดใช้
สั่งซื้อใหม่อีกครั้ง (reorder): ปุ่ม ReorderButton.tsx แสดงเมื่อ order.status === "cancelled" เรียก reorderAction(orderId) — อ่าน order_items เดิม (ข้ามสินค้าปิดขาย/หมดสต็อก) → เพิ่มกลับเข้าตะกร้า → redirect ไปหน้าตะกร้า
ตรวจ RLS ที่ใช้ครบแล้ว (order_items_select_via_own_order, products_select_active_public, carts_all_own, cart_items_all_via_own_cart) ไม่มีช่องโหว่
หมายเหตุ: ปุ่มยกเลิกแสดงเฉพาะตอน order.status === "pending" เท่านั้น (ดูผลกับ COD ที่หัวข้อด้านล่าง — COD ไม่ผ่านสถานะ pending เลย จึงไม่มีปุ่มยกเลิกให้กด)
✅ ข้อ 8: Payment gateway (Opn Payments โหมดทดสอบ/sandbox) — ครบทั้ง 3 วิธี เสร็จสมบูรณ์แล้ว ผู้ใช้ทดสอบผ่านหมด
พร้อมเพย์ — ทดสอบผ่านแล้ว

เลือก Opn Payments, ใช้ ปุ่มเช็คสถานะเอง แทน webhook ระหว่างพัฒนา (localhost รับ webhook จริงจาก Opn เข้าไม่ถึง)

สถาปัตยกรรม:

src/lib/supabase/service.ts — Supabase client ด้วย service_role key (ข้าม RLS ได้หมด) ใช้เฉพาะฝั่งเซิร์ฟเวอร์ที่เชื่อถือได้เท่านั้น ทุกจุดที่เรียกต้องเช็คสิทธิ์เจ้าของออเดอร์เองในโค้ดก่อนเสมอ (ฟังก์ชัน assertOwnOrder ใน payments.ts)
src/lib/payments/opn.ts — เรียก Opn Payments REST API ตรงๆ ด้วย secret key (HTTP Basic Auth): createPromptPayCharge() สร้าง Source+Charge จริง คืน QR image จริง (data URI), getCharge() ดึงสถานะ charge ปัจจุบัน (ใช้ร่วมกับบัตรและ 3-D Secure ด้วย)
src/lib/data/payments.ts — getPaymentByOrderId() อ่านข้อมูลการชำระเงินของออเดอร์
src/lib/actions/payments.ts — getOrCreatePromptPayQrAction, checkPromptPayStatusAction (ชื่อฟังก์ชันเหลือจากตอนทำพร้อมเพย์ แต่ใช้ตรวจสอบ charge อะไรก็ได้ ไม่ผูกกับพร้อมเพย์เท่านั้น — ใช้ซ้ำกับหน้ายืนยันตัวตนบัตร 3-D Secure ด้วย)
หน้า checkout/promptpay/[orderId]/page.tsx + PromptPayStatus.tsx
DB migration allow_cod_payment_method — แก้ payments_payment_method_check ให้รองรับ cod ด้วย

⚠️ ปรับปรุงเพิ่มเติมโดยผู้ใช้เอง (พบระหว่างเซสชันทำ COD — ไม่ใช่ Claude ทำ): ผู้ใช้/อีกเซสชันแก้ opn.ts, payments.ts, PromptPayStatus.tsx เพิ่มระบบนับเวลาหมดอายุ QR จาก expiresAt จริง (คำนวณจาก created_at ของ Opn + 30 นาที) แทนตัวนับถอยหลังคงที่ฝั่ง client เดิม ทำให้เวลานับถอยหลังตรงกับความเป็นจริงแม้โหลดหน้าซ้ำ/สลับแท็บ — Claude ตรวจพบและ sync เข้า cloud mirror แล้วระหว่างทำงานรอบ COD

บั๊กที่เจอตอนทดสอบรอบแรก + วิธีแก้ (สำคัญ — จำไว้เผื่อเจอซ้ำ): "Invalid API key" ตอนสั่งซื้อด้วยพร้อมเพย์ — สาเหตุคือ SUPABASE_SERVICE_ROLE_KEY (JWT ยาว) ถูก editor ตัดขึ้นบรรทัดใหม่กลางคันตอนวางใน .env.local กลายเป็น 2 บรรทัด dotenv อ่านไม่ครบ — แก้โดยรวมกลับเป็นบรรทัดเดียว (ต้องระวังทุกครั้งที่ paste JWT/คีย์ยาวๆ ลง .env.local) — แก้แล้ว ใช้งานได้จริง

บัตรเครดิต/เดบิต — ทดสอบผ่านแล้ว (ยืนยันโดยผู้ใช้: ออเดอร์ #8 ขึ้น "ชำระเงินแล้ว" ถูกต้อง)

ใช้ Omise.js client-side tokenization เลขบัตรจริงไม่เคยผ่านเซิร์ฟเวอร์เราเลย (ตามข้อกำหนด PCI) charge บัตรเป็นแบบทันที (รู้ผลสำเร็จ/ล้มเหลวตอนกด "ยืนยันคำสั่งซื้อ" เลย ไม่ต้องรอเหมือนพร้อมเพย์)

สถาปัตยกรรม:

CheckoutForm.tsx (client): โหลด https://cdn.omise.co/omise.js ผ่าน next/script, ตั้ง public key จาก NEXT_PUBLIC_OPN_PUBLIC_KEY — กด "ยืนยันคำสั่งซื้อ" ครั้งแรกด้วยบัตร: e.preventDefault() → Omise.createToken("card", {...}) → ได้ token เก็บใน state + hidden input cardToken → formRef.current.requestSubmit() ส่งฟอร์มจริงอีกที — token ถูกล้างทิ้งทุกครั้งที่แก้ข้อมูลบัตรหรือสลับวิธีชำระเงิน
src/lib/payments/opn.ts — createCardCharge(amountBaht, description, cardToken, returnUri): ยิง POST /charges ด้วย card=<token> ตรงๆ คืนสถานะ + authorizeUri (ถ้าต้อง 3-D Secure)
src/lib/actions/orders.ts — createOrderAction: หลัง insert payments แล้ว ถ้าเป็นบัตรจะเรียก createCardCharge ทันที — สำเร็จ → payments.payment_status='success' + orders.order_status='paid' ทันที; ล้มเหลว → ลบออเดอร์ทิ้งทั้งหมดให้ลองใหม่; ต้อง 3-D Secure → redirect ไปหน้าธนาคารตรงๆ แล้ววนกลับมาที่ /checkout/card/[orderId]/complete
หน้าใหม่ checkout/card/[orderId]/complete/page.tsx — จุดรับกลับหลัง 3-D Secure เรียก checkPromptPayStatusAction ซ้ำเพื่อสรุปผล

หมายเหตุ: การ์ดทดสอบมาตรฐาน (เช่น 4242 4242 4242 4242) ได้ผล successful ทันทีไม่ผ่าน 3DS ตามคาด — เส้นทาง 3-D Secure ในโค้ดยังไม่เคยถูกทดสอบจริง (เตรียมไว้เผื่อ)

เรื่องยอดเงินไม่ตรงใน Opn Dashboard (ไม่ใช่บั๊ก): "Total Balance" ใน Opn Dashboard คือยอดหลังหักค่าธรรมเนียมธุรกรรมของ Opn (ประมาณ 3.65% + VAT 7%) ไม่ใช่ยอดขายจริงที่ต้องเก็บ/แสดงในเว็บเรา — ไม่ใช่บั๊ก ไม่ต้องแก้อะไร — payment gateway ทั่วไปไม่มีฟีเจอร์ลบ transaction ในแดชบอร์ดเอง แม้โหมดทดสอบ (เป็น audit trail)

ชำระเงินปลายทาง (COD) — เสร็จแล้ว ผู้ใช้ทดสอบสั่งซื้อจริงผ่านแล้ว (ออเดอร์ #9 ขึ้น "รอจัดส่ง" ถูกต้อง, payments แถว cod/pending ตรงตามคาด)

COD ไม่มีขั้นตอนจ่ายเงินล่วงหน้า (ลูกค้าจ่ายตอนได้รับของ) จึงไม่สมเหตุสมผลที่จะเริ่มออเดอร์ที่สถานะ "pending" (รอชำระเงิน) เหมือนวิธีอื่น — เปลี่ยนให้ COD เริ่มที่สถานะ "processing" ไปเลย (ข้าม pending/paid) ซึ่งแสดงผลเป็นป้าย "รอจัดส่ง"

การเปลี่ยนแปลง:

src/lib/actions/orders.ts — createOrderAction: เพิ่ม const initialOrderStatus = paymentMethod === "cod" ? "processing" : "pending"; ใช้ตอน insert orders แทนการ hardcode "pending" เดิม (วิธีอื่นยังเริ่มที่ pending เหมือนเดิม)
src/lib/demo-data.ts — เปลี่ยนป้าย label ของสถานะ processing จาก "กำลังเตรียมสินค้า" เป็น "รอจัดส่ง" ตามที่ผู้ใช้ขอ (ใช้ enum processing เดิมที่มีอยู่แล้วในฐานข้อมูล ไม่ต้องเพิ่มค่าสถานะใหม่หรือแก้ CHECK constraint) — ป้ายนี้ใช้ร่วมกันทุกออเดอร์ที่อยู่สถานะ processing (ทั้ง COD ตั้งแต่แรก และออเดอร์พร้อมเพย์/บัตรที่จ่ายแล้วแล้วเข้าสู่ขั้นเตรียมสินค้า) — ความหมายใกล้เคียงกันจึงใช้ป้ายเดียวกันได้โดยไม่ขัดกัน
ผลข้างเคียงที่ตั้งใจปล่อยไว้: เพราะปุ่ม/RLS ยกเลิกออเดอร์ (orders_update_own_cancel) อนุญาตแค่ pending→cancelled เท่านั้น ออเดอร์ COD (เริ่มที่ processing) ลูกค้าจะกดยกเลิกเองไม่ได้อีกต่อไป — ยังไม่ได้คุยเพิ่มว่าต้องการช่องทางยกเลิกอื่นให้ COD ไหม (เช่น RLS ใหม่ที่อนุญาต processing→cancelled เฉพาะ COD)

ENV vars ที่ตั้งไว้ใน .env.local บนเครื่องผู้ใช้แล้ว (ค่าจริงอยู่ในแชทเท่านั้น ไม่บันทึกไว้ที่นี่): OPN_SECRET_KEY, NEXT_PUBLIC_OPN_PUBLIC_KEY, SUPABASE_SERVICE_ROLE_KEY

🔍 ตรวจสอบฐานข้อมูลทั้งหมด (audit ล่าสุด) — สรุปผล: โครงสร้าง/RLS ถูกต้องครบ ไม่มีปัญหาระดับ error

ตรวจผ่าน Supabase MCP ก่อนเริ่มทำ payment gateway (ตอนนั้น MCP ยังต่อกับ project_id ที่ถูกต้อง wrokdxuxazwzpttghrko — ดูหมายเหตุปัญหาบัญชีไม่ตรงกันด้านบนสำหรับเซสชันหลังจากนี้):

ครบทั้ง 11 ตาราง ตรงกับ [[desklab-schema.md]] ทุกตาราง เปิด RLS ครบทุกตาราง (rowsecurity = true หมด)
orders มีคอลัมน์ cancel_reason (text, nullable) เพิ่มมาแล้วจริงในฐานข้อมูล
Security advisor: เจอ 1 WARN คือ "Leaked Password Protection Disabled" — สวิตช์ที่ผู้ใช้เปิดเองได้ใน Dashboard > Authentication แนะนำเปิดตอนใกล้เปิดร้านจริง
Performance advisor: ไม่มี error แค่ข้อเสนอแนะเชิงประสิทธิภาพ (ไม่กระทบตอนนี้เพราะข้อมูลยังน้อย): RLS หลายตารางเรียก auth.uid() ตรงๆ แทน (select auth.uid()), FK 4 คอลัมน์ยังไม่มี index, unused index 3 อัน
ไม่พบข้อมูลขยะ/ค้าง
⚠️ ผู้ใช้เริ่มแก้ Frontend เองบางส่วนแล้ว (สำคัญ — อ่านก่อนแก้โค้ดในเซสชันถัดไป)

ผู้ใช้ปรับแก้ Frontend เองบ้าง (Navbar.tsx, ฟีเจอร์ยกเลิกคำสั่งซื้อ+เหตุผล+สั่งซื้อใหม่อีกครั้งทั้งระบบ, คอลัมน์ orders.cancel_reason, ระบบนับเวลาหมดอายุ QR จริงใน opn.ts/payments.ts/PromptPayStatus.tsx) — mirror ของโปรเจกต์ในฝั่ง cloud workspace (/home/claude/desklab-web/) อาจไม่ตรงกับไฟล์จริงบนเครื่องผู้ใช้เสมอ ก่อนแก้ไฟล์ใดๆ ในเซสชันถัดไป ต้อง device_stage_files ไฟล์ล่าสุดจากเครื่องผู้ใช้มาอ่านก่อนเสมอ อย่าแก้จาก mirror เก่าโดยไม่เช็ค แล้วค่อย sync กลับเข้า mirror ก่อนแก้ต่อ — ก่อนคอมมิตทุกครั้งควร stage ไฟล์ปลายทางอีกรอบแล้ว diff กับสิ่งที่แก้ไป อัปเดต: Claude แก้ CheckoutForm.tsx เองมาแล้ว 2 รอบ (เอา mock QR modal ออกตอนทำพร้อมเพย์, เอาฟอร์มกรอกบัตรแบบ mock ออกตอนทำบัตรเครดิต/เดบิต) — ผู้ใช้รับทราบและทดสอบผ่านแล้วทั้งคู่ อัปเดต (2026-09-02): พบว่าเซสชันนี้ไม่มี device_bash แต่มี Desktop Commander (MCP ในเครื่องผู้ใช้เอง, tools ชื่อ mcp__remote-devices__plugin_desktop-commander_desktop-commander__*) ต่ออยู่ — ใช้ read_file/list_directory ยืนยันไฟล์บนเครื่องตรงกับ cloud mirror ได้จริง และใช้ move_file/create_directory ลบไฟล์ขยะ (ResetPasswordGate.tsx → ย้ายไป _to_delete/) ได้จริงด้วย แม้ device_commit_files เองลบไฟล์ไม่ได้ — มีประโยชน์มากสำหรับ verify + cleanup โดยไม่ต้องพึ่งผู้ใช้ลบเอง

แผนขั้นตอน (Phase 1: ร้านค้าออนไลน์)
ออกแบบ (Design) — ✅ เสร็จสมบูรณ์
เชื่อมฐานข้อมูล Supabase — ✅ สร้างตารางเสร็จแล้ว + RLS เปิดใช้งานสำเร็จแล้ว + มีข้อมูลสินค้าจริงแล้ว
Frontend จาก Wireframe — ✅ เสร็จแล้ว
ปรับ Frontend เป็น "โหมดผู้ใช้งานจริง" — ✅ เสร็จแล้ว
เชื่อมแคตตาล็อกสินค้ากับ Supabase จริง — ✅ เสร็จแล้ว
ทำ Auth จริงผ่าน Supabase Auth (สมัคร/ล็อกอิน/ล็อกเอาต์) — ✅ เสร็จแล้ว ผู้ใช้ทดสอบผ่านแล้ว
เชื่อมตะกร้า/ที่อยู่/ประวัติคำสั่งซื้อกับฐานข้อมูลจริง — ✅ เสร็จสมบูรณ์ทั้งหมด
เลือก payment gateway แล้วต่อ Checkout เข้ากับ API จริง — ✅ เสร็จสมบูรณ์ทั้งหมด ผู้ใช้ทดสอบผ่านทั้ง 3 วิธี

Phase 1 ปิดงานหลักครบแล้ว ตอนนี้กำลังไล่ทำงานเสริมทีละอย่างตามลำดับที่ผู้ใช้ให้มา ("เริ่มงานที่ค้างต่อได้เลย ... ทำไปทีละขั้นตอน"):

หน้า "ลืมรหัสผ่าน" จริง — 🚧 พักไว้ก่อนตามคำขอผู้ใช้ (ดูหัวข้อด้านบน — เจอบั๊กจริงระหว่างทดสอบ 3 รอบ ยังแก้ไม่จบ)
อัปโหลดรูปโปรไฟล์ — ✅ โค้ด+ฐานข้อมูลเสร็จสมบูรณ์ทั้งหมด รอผู้ใช้ทดสอบ (ดูหัวข้อด้านบน)
ปุ่มแสดง/ซ่อนรหัสผ่านตอนล็อกอิน — ✅ เขียนโค้ดเสร็จแล้ว ส่งไฟล์ + คอมมิตเข้าเครื่องผู้ใช้แล้ว (2026-09-02) รอผู้ใช้ทดสอบ — สร้าง component ใหม่ src/components/PasswordInput.tsx (client component, toggle type="password"/"text" ด้วย useState + ปุ่มไอคอนตา, มี aria-pressed/sr-only label) ใช้แทน <input type="password"> เดิมทั้งในหน้า /login (LoginForm.tsx) และหน้า /register (page.tsx, ผู้ใช้ขอเพิ่มเองทีหลัง — ใช้กับทั้งช่องรหัสผ่านและยืนยันรหัสผ่าน) — build+lint ผ่านทั้งคู่ (เหลือแค่ 2 error เดิมไม่เกี่ยวข้อง) — ยังไม่ได้ใส่ในหน้า reset-password (ถ้าต้องการเพิ่มทีหลังก็ import component เดิมไปวางแทนได้เลย)

🐛 บั๊กที่เจอระหว่างแก้หน้า register (สำคัญ — ตรวจสอบแล้วว่าเป็นของจริง ไม่ใช่แค่ทฤษฎี): cloud mirror กับไฟล์บนเครื่องผู้ใช้ไม่ตรงกัน — src/app/(auth)/register/page.tsx บนเครื่องผู้ใช้ (ก่อนแก้รอบนี้) ใช้ field id/name "name" (label "ชื่อผู้ใช้" placeholder generic "john_doe") แต่ signUpAction ใน src/lib/actions/auth.ts (ทั้งบนเครื่องและ cloud mirror) อ่านค่าจาก formData.get("fullName") — field name ไม่ตรงกัน แปลว่าฟอร์มสมัครสมาชิกน่าจะส่งชื่อไปไม่ถึง signUpAction เลยตอนนี้ (เช็ค mtime แล้ว auth.ts ใหม่กว่า register/page.tsx บนเครื่อง ~80 นาที คาดว่า auth.ts เคยถูกเปลี่ยนชื่อ field แต่ register/page.tsx ไม่เคยตามให้ตรง) — แก้ไปพร้อมกันแล้ว: ใช้เวอร์ชัน cloud mirror ที่ field id "fullName" (label "ชื่อ-นามสกุล" ตรงกับ auth.ts) เป็นฐาน ส่งเข้าเครื่องผู้ใช้แล้ว — ยังไม่ได้ให้ผู้ใช้ทดสอบสมัครสมาชิกซ้ำเพื่อยืนยันว่าบั๊กนี้หายจริง (ควรลองสมัครสมาชิกใหม่ 1 บัญชีทดสอบดู ชื่อบันทึกถูกไหม) 4. ตัดสต็อกสินค้าจริงตอนสั่งซื้อ — ✅ โค้ด+ฐานข้อมูลเสร็จแล้ว รอผู้ใช้ทดสอบ (ดูหัวข้อด้านบน)

Phase 1 + งานเสริมทั้ง 4 ข้อ เขียนโค้ดเสร็จหมดแล้ว เหลือรอผู้ใช้ทดสอบยืนยันข้อ 3 (register field ที่แก้บั๊ก) และข้อ 4 (ตัดสต็อก) เท่านั้น ข้อ 1 (ลืมรหัสผ่าน) ยังพักไว้ตามคำขอ

🔜 ขั้นต่อไปที่แนะนำ

ข้อ 2 (อัปโหลดรูปโปรไฟล์): ผู้ใช้ทดสอบแล้ว ใช้งานได้จริง ✅ ปิดงานนี้แล้ว ข้อ 3: ผู้ใช้ทดสอบปุ่มโชว์/ซ่อนรหัสผ่านแล้ว ผ่าน ✅ — แต่ ยังไม่ได้ทดสอบยืนยันบั๊ก fullName/name ที่แก้ไปพร้อมกัน ควรลองสมัครสมาชิกบัญชีทดสอบใหม่ดูว่าชื่อบันทึกถูกไหม (ดูหัวข้อ register ด้านบน) ข้อ 4 (ตัดสต็อกสินค้าจริง): โค้ด+migration เสร็จแล้ว ส่งเข้าเครื่องแล้ว รอผู้ใช้ทดสอบสั่งซื้อจริง 1 ออเดอร์ แล้วเช็คว่า stock ลดถูกต้อง (ดูหัวข้อด้านบน) — เป็นข้อสุดท้ายในลำดับงานเสริม 4 ข้อที่ผู้ใช้สั่งไว้

หน้าลืมรหัสผ่าน: พักไว้ก่อนตามคำขอผู้ใช้ — จะกลับมาสืบต่อก็ต่อเมื่อผู้ใช้ขอเอง (ดูหัวข้อ root-cause ด้านบนสำหรับบริบทเต็มตอนกลับมาทำ)

(ถ้าต้องการ) ทางยกเลิกออเดอร์ COD: ตอนนี้ลูกค้ายกเลิกออเดอร์ COD เองไม่ได้แล้ว (เพราะเริ่มที่ processing ไม่ใช่ pending) — ถ้าอยากให้ยกเลิกได้ต้องคุยกันเพิ่มว่าจะเปิดทางไหน (เช่น RLS ใหม่)

(ถ้าต้องการ) Webhook จริงจาก Opn: เปลี่ยนจากปุ่มเช็คสถานะเองมาเป็น webhook จริง — ต้องมี public URL (เช่น ngrok) ก่อนถึงจะทดสอบได้บน localhost

งานเสริมที่เหลืออีก (ไม่บล็อกข้อ 8 แล้ว): รูปสินค้าจริง (product_images ยังว่างเปล่า), เปิด Leaked Password Protection ใน Dashboard ก่อนเปิดร้านจริง, ตั้งค่า SMTP เองก่อนเปิดร้านจริง (ใช้ร่วมกับ Confirm email ด้วย, น่าจะช่วยแก้ปัญหาลืมรหัสผ่านไปด้วย), (ไม่เร่งด่วน) ปรับ RLS policies ให้ใช้ (select auth.uid()) แทน auth.uid() ตรงๆ

ทำทีละส่วนตามที่ผู้ใช้ขอ ไม่รวดเดียว

Phase 2 (หลังร้านค้าเสร็จ)

โปรแกรมจำลองการจัดโต๊ะ — ยังไม่ลงรายละเอียด

สภาพแวดล้อมการทำงานของผู้ใช้ (สำคัญ — อ่านก่อนแนะนำขั้นตอนที่ต้องรันคำสั่ง)
ผู้ใช้มี 2 เครื่อง: (1) MacBook ของโรงเรียน — เวอร์ชันเก่า อัปเดตไม่ได้ ลงโปรแกรมบางตัวไม่ได้เดิม แต่ผู้ใช้แก้ปัญหา npm/Node.js เองสำเร็จแล้วและรันโปรเจกต์ผ่าน localhost:3000 ได้จริงบนเครื่องนี้ (2) เครื่อง Windows 11 ที่บ้าน — เป็นเครื่องหลักที่ผู้ใช้ใช้ทำ "Frontend เต็มๆ" ที่เชื่อมข้อมูลจริง (แก้ปัญหา npm ไม่มีบนเครื่องนี้ไปแล้วเช่นกัน)
เซสชัน Cowork นี้ผูกกับเครื่อง Windows 11 ที่บ้าน (โฟลเดอร์ที่เชื่อมไว้: C:\Users\ADMIN\OneDrive\Desktop\Desklab project — โปรเจกต์ Next.js อยู่ที่ root ของโฟลเดอร์นี้ตรงๆ ไม่มีโฟลเดอร์ย่อยชื่อ desklab-web, device id เดิม desktop-2f3mdhe) — ต้องเปิดแอป Claude desktop บนเครื่องนั้นถึงจะเชื่อมต่อได้ — ไม่มี device_bash บนเครื่องนี้ (ต้องแก้โค้ดในฝั่ง cloud workspace แล้วส่งไฟล์ไปเขียนทับที่เครื่องผู้ใช้ผ่าน device_commit_files เท่านั้น) แต่ มี Desktop Commander MCP ต่ออยู่บนเครื่องผู้ใช้เอง (mcp__remote-devices__plugin_desktop-commander_desktop-commander__*) ใช้ read_file/list_directory ตรวจสอบไฟล์จริงบนเครื่อง และ move_file/create_directory ลบ/ย้ายไฟล์ขยะได้ (device_commit_files เองลบไฟล์ไม่ได้) — แนวทางที่ใช้ตอนนี้: stage ไฟล์ล่าสุดจากเครื่องผู้ใช้มาอ่านก่อนเสมอ (ผู้ใช้แก้โค้ดเองได้ mirror อาจไม่ตรง), แก้/สร้างไฟล์ที่ /home/claude/desklab-web/ (ชื่อ mirror ฝั่ง cloud เท่านั้น ไม่เกี่ยวกับ path จริงบนเครื่องผู้ใช้), รัน npm run build ทดสอบด้วย env ปลอมก่อนทุกครั้ง แล้วค่อย SendUserFile + device_commit_files ไปที่เครื่องจริง (เช็ค diff กับของบนเครื่องอีกรอบก่อนคอมมิตทุกครั้ง กันทับของที่ผู้ใช้แก้เอง)
ข้อจำกัดสำคัญ: device_commit_files เขียนไฟล์ .env* ไม่ได้เด็ดขาด (ระบบบล็อกไว้) — ผู้ใช้ต้องสร้าง/แก้ .env.local เองบนเครื่องเสมอ โดยรับเนื้อหาจากแชท — ระวัง: JWT/คีย์ยาวๆ อาจถูก editor ตัดขึ้นบรรทัดใหม่กลางคันตอนวาง (เจอปัญหานี้จริงกับ SUPABASE_SERVICE_ROLE_KEY มาแล้ว ทำให้ Supabase ปฏิเสธเป็น "Invalid API key") — เตือนผู้ใช้ให้ตรวจว่าค่ายาวๆ อยู่บรรทัดเดียวเสมอ หรือ stage .env.local มาอ่านตรวจสอบเองได้ถ้าสงสัย
ฟอนต์: ใช้ system font stack แทน next/font/google ชั่วคราวเพราะ sandbox ของ Claude ดึง Google Fonts ตอน build ไม่ได้ — บนเครื่องจริงที่มีเน็ตปกติ สามารถสลับกลับไปใช้ next/font/google ได้ตามคอมเมนต์ใน src/app/layout.tsx
Supabase MCP: เชื่อมต่อสำเร็จในเซสชันนี้แล้ว (ผู้ใช้ล็อกอินเองผ่านเบราว์เซอร์ในตัวของ Claude) — แต่ดูหมายเหตุสำคัญด้านบน (หัวข้อ "Supabase MCP เชื่อมกับ Cowork") เรื่องบัญชี/โปรเจกต์ที่ต่ออยู่อาจไม่ตรงกับโปรเจกต์จริงของแอป (wrokdxuxazwzpttghrko) — ต้องเช็ค project_id ทุกครั้งก่อนรัน SQL จริงผ่าน MCP — ไม่มี tool แก้ Auth config (Redirect URLs, SMTP, Confirm email ฯลฯ) เสมอ ต้องให้ผู้ใช้กดเองใน Dashboard
หมายเหตุเครือข่าย: cloud sandbox ของ Claude เข้าถึง api.supabase.co / api.omise.co ตรงๆ ไม่ได้ (egress policy บล็อกไว้) — ทดสอบ external API call ต้องพึ่งการรันจริงบนเครื่องผู้ใช้เท่านั้น