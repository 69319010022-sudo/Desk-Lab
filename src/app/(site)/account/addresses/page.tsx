import { getAddresses } from "@/lib/data/addresses";
import AddressCard from "./AddressCard";
import AddAddressForm from "./AddAddressForm";

// หน้าที่อยู่จัดส่งจริง: ดึง/เพิ่ม/แก้/ลบที่อยู่จาก Supabase ตรงๆ (RLS จำกัดให้เห็นเฉพาะของตัวเอง)
export default async function AddressesPage() {
  const addresses = await getAddresses();

  return (
    <div className="space-y-4">
      {addresses.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">ยังไม่มีที่อยู่จัดส่งที่บันทึกไว้</p>
      )}
      {addresses.map((addr) => (
        <AddressCard key={addr.id} address={addr} />
      ))}
      <AddAddressForm />
    </div>
  );
}
