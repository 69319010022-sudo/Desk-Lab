import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data/auth";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  // account/layout.tsx เช็คแล้วว่าต้องล็อกอิน แต่กันไว้อีกชั้นเผื่อ session
  // หมดอายุพอดีตอน render (TypeScript ก็ต้องการให้แน่ใจว่า user ไม่ใช่ null ด้วย)
  if (!user) redirect("/login");

  return <ProfileForm user={user} />;
}
