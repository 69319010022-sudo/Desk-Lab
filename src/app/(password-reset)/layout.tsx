import Link from "next/link";

// เลย์เอาต์แยกจาก (auth) ตั้งใจไว้ — (auth)/layout.tsx จะ redirect ผู้ใช้ที่ล็อกอินอยู่แล้วออกไปหน้าโปรไฟล์
// ทันที ซึ่งจะพังกับหน้า /reset-password เพราะลิงก์ตั้งรหัสผ่านใหม่จากอีเมลทำให้ผู้ใช้มี session แล้ว
// (ผ่าน /auth/confirm) ก่อนจะมาถึงหน้านี้ — เลย์เอาต์นี้จึงไม่มีการเช็ค/redirect ตามสถานะล็อกอินเลย
export default function PasswordResetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center px-6 md:px-10">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="inline-block h-8 w-8 rounded-md bg-primary" />
            DeskLab
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center bg-surface px-6 py-16">
        {children}
      </main>
    </>
  );
}
