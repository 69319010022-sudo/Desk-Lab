import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // ถ้าล็อกอินอยู่แล้ว ไม่ต้องเห็นหน้า login/register อีก พาไปหน้าโปรไฟล์เลย
  const user = await getCurrentUser();
  if (user) redirect("/account/profile");

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
