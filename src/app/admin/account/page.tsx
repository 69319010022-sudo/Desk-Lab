import { getCurrentUser } from "@/lib/data/auth";
import { signOutAction } from "@/lib/actions/auth";

// หน้าบัญชีแอดมิน — ยังไม่มีในแผน 8 ขั้นตอนหลัก (เป็นหน้าเสริมของเมนู "บัญชี" ใน Sidebar)
// ตอนนี้แค่โชว์ข้อมูลบัญชีตัวเอง (username/email) แบบอ่านอย่างเดียว ยังไม่มีฟอร์มแก้ไข
// ปุ่มออกจากระบบใช้ signOutAction เดียวกับเมนู avatar ใน AdminTopBar.tsx (ใส่ไว้ตรงนี้ด้วยเพื่อ
// ให้กดออกจากระบบได้จากหน้าบัญชีตรงๆ ไม่ต้องเลื่อนไปหาเมนู avatar)
export default async function AdminAccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="max-w-md rounded-2xl border border-border bg-background p-6">
      <h2 className="mb-4 text-sm font-semibold text-ink">ข้อมูลบัญชีแอดมิน</h2>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-muted">ชื่อผู้ใช้</dt>
          <dd className="font-medium text-ink">{user?.name ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-muted">อีเมล</dt>
          <dd className="font-medium text-ink">{user?.email}</dd>
        </div>
        <div>
          <dt className="text-muted">สิทธิ์การใช้งาน</dt>
          <dd className="font-medium text-ink">{user?.role === "admin" ? "แอดมิน" : "ลูกค้า"}</dd>
        </div>
      </dl>

      <form action={signOutAction} className="mt-6 border-t border-border pt-5">
        <button
          type="submit"
          className="rounded-lg border border-[color:var(--color-status-cancelled)]/30 px-4 py-2 text-sm font-medium text-[color:var(--color-status-cancelled)] transition-colors hover:bg-[color:var(--color-status-cancelled-bg)]"
        >
          ออกจากระบบ
        </button>
      </form>
    </div>
  );
}
