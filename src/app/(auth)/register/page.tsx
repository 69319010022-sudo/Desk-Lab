import RegisterForm from "./RegisterForm";

// Server Component บาง ๆ (ตามแพทเทิร์นเดียวกับ login/page.tsx) — ตั้ง metadata แล้วส่งต่อให้
// RegisterForm (Client Component) ที่มีฟอร์มจริงต่อ Supabase Auth ทั้งหมด
export const metadata = {
  title: "สมัครสมาชิก - DeskLab",
  description: "สร้างบัญชี DeskLab ใหม่และเริ่มช้อปปิ้ง",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
