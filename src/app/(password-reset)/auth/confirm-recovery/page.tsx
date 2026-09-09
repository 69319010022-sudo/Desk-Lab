import { redirect } from "next/navigation";
import ConfirmRecoveryForm from "./ConfirmRecoveryForm";

// หน้ายืนยันก่อนแลก code เป็น session จริง (ดูเหตุผลใน /auth/confirm/route.ts) — ต้องให้ผู้ใช้
// กดปุ่มเองเท่านั้น ถึงจะเรียก confirmPasswordResetAction (Server Action ที่แลก code จริง)
export default async function ConfirmRecoveryPage(props: PageProps<"/auth/confirm-recovery">) {
  const searchParams = await props.searchParams;
  const code = typeof searchParams?.code === "string" ? searchParams.code : "";
  const next = typeof searchParams?.next === "string" ? searchParams.next : "/reset-password";

  if (!code) {
    redirect("/forgot-password?error=invalid_link");
  }

  return <ConfirmRecoveryForm code={code} next={next} />;
}
