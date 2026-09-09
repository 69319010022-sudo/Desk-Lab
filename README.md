# DeskLab

ร้านขายของแต่งโต๊ะคอมออนไลน์ (Next.js + Supabase) พร้อมแผนต่อยอดเป็นโปรแกรมจำลองการจัดโต๊ะใน Phase 2

## Tech stack

- **Next.js (App Router)** + React + TypeScript
- **Tailwind CSS v4**
- **Supabase** — Postgres + Auth + Storage + Row Level Security
- **Opn Payments (เดิม Omise)** — พร้อมเพย์ / บัตรเครดิต-เดบิต / เก็บเงินปลายทาง (COD)

## เริ่มต้นใช้งาน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

ต้องมีไฟล์ `.env.local` ที่ root ก่อน (ไม่ได้ commit เข้า repo) โดยมีค่าเหล่านี้:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPN_SECRET_KEY=
NEXT_PUBLIC_OPN_PUBLIC_KEY=
```

> ⚠️ คีย์ยาว ๆ (JWT) ต้องอยู่บรรทัดเดียวเท่านั้น ถ้า editor ตัดขึ้นบรรทัดใหม่ dotenv จะอ่านไม่ครบ
> และ Supabase จะปฏิเสธเป็น "Invalid API key"

## โครงสร้างโฟลเดอร์

```
.
├─ src/
│  ├─ app/                    # หน้าเว็บทั้งหมด (App Router)
│  │  ├─ (auth)/              # เข้าสู่ระบบ / สมัครสมาชิก
│  │  ├─ (password-reset)/    # ลืมรหัสผ่าน / ตั้งรหัสผ่านใหม่
│  │  ├─ (site)/              # หน้าร้านหลัก: home, shop, product, cart, checkout, account
│  │  ├─ auth/confirm/        # route handler รับลิงก์ยืนยันจากอีเมล
│  │  ├─ globals.css          # design token + Tailwind
│  │  └─ layout.tsx
│  ├─ components/             # UI component ที่ใช้ร่วมกัน
│  └─ lib/
│     ├─ actions/             # Server Actions (auth, cart, orders, payments, addresses, profile)
│     ├─ data/                # เลเยอร์ดึงข้อมูลจาก Supabase (อ่านอย่างเดียว)
│     ├─ payments/            # ตัวเชื่อม Opn Payments API
│     └─ supabase/            # client / server / middleware / service-role clients
├─ public/products/           # รูปสินค้า (SVG)
├─ supabase/                  # schema, seed, migrations (ดู supabase/README.md)
├─ docs/                      # เอกสารโปรเจกต์ + รูปไดอะแกรม
├─ middleware.ts              # ต่ออายุ session token ทุก request
└─ next.config.ts
```

## เอกสาร

| ไฟล์ | เนื้อหา |
|---|---|
| [`docs/desklab-plan.md`](docs/desklab-plan.md) | แผนงาน สถานะ และการตัดสินใจทั้งหมดของโปรเจกต์ (เอกสารหลัก) |
| [`docs/project-brief.md`](docs/project-brief.md) | โจทย์/ขอบเขตโปรเจกต์ตั้งต้น |
| [`docs/assets/database-erd.png`](docs/assets/database-erd.png) | ผังฐานข้อมูล (ERD) |
| [`docs/assets/system-design.png`](docs/assets/system-design.png) | ผัง System Design |
| [`supabase/README.md`](supabase/README.md) | สคีมา + รายการ migration ที่ apply ไปแล้ว |

## คำสั่งที่ใช้บ่อย

```bash
npm run dev     # เซิร์ฟเวอร์สำหรับพัฒนา
npm run build   # build production (เช็ค type ด้วย)
npm run lint    # ESLint
npm run start   # รัน production build
```
