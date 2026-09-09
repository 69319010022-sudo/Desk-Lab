import { redirect } from "next/navigation";
import Container from "@/components/Container";
import AccountSidebar from "@/components/AccountSidebar";
import { getCurrentUser } from "@/lib/data/auth";

// หน้าในกลุ่ม /account/* ทั้งหมดต้องล็อกอินก่อนถึงจะเข้าได้ — ไม่งั้นเด้งไปหน้า login
// ปรับสไตล์หัวข้อ + spacing ให้เข้าธีม POS เท่านั้น ไม่แตะ logic การเช็ก user
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <Container className="flex flex-col gap-6 py-10">
      <div>
        <h1 className="text-[24px] font-semibold tracking-[-0.2px] text-ink">บัญชีของฉัน</h1>
        <p className="mt-1 text-[14px] text-muted">DeskLab · จัดการโปรไฟล์และคำสั่งซื้อของคุณ</p>
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        <AccountSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </Container>
  );
}
