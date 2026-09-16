import { getCurrentUser } from "@/lib/data/auth";

// หน้าบัญชีแอดมิน — ยังไม่มีในแผน 8 ขั้นตอนหลัก (เป็นหน้าเสริมของเมนู "บัญชี" ใน Sidebar)
// ตอนนี้แค่โชว์ข้อมูลบัญชีตัวเอง (username/email) แบบอ่านอย่างเดียว ยังไม่มีฟอร์มแก้ไข
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
    </div>
  );
}
