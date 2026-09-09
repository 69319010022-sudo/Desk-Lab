import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/auth";
import ResetPasswordForm from "./ResetPasswordForm";

// ต้องมี session อยู่แล้วเท่านั้นถึงจะเข้าหน้านี้ได้ (มาจากลิงก์ในอีเมล ผ่าน /auth/confirm-recovery
// ที่แลก code เป็น session ให้ก่อนหน้านี้แล้ว) — ถ้าไม่มี session แปลว่าเข้ามาตรงๆ โดยไม่ผ่าน
// ลิงก์ที่ถูกต้อง พาไปขอลิงก์ใหม่แทน
export default async function ResetPasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/forgot-password");

  return <ResetPasswordForm />;
}
