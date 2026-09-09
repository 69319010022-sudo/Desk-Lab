import { createClient } from "@/lib/supabase/server";

export type Address = {
  id: number;
  label: string | null;
  recipientName: string | null;
  phone: string | null;
  addressLine: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  postalCode: string | null;
  isDefault: boolean;
};

type AddressRow = {
  id: number;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  address_line: string | null;
  subdistrict: string | null;
  district: string | null;
  province: string | null;
  postal_code: string | null;
  is_default: boolean;
};

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine: row.address_line,
    subdistrict: row.subdistrict,
    district: row.district,
    province: row.province,
    postalCode: row.postal_code,
    isDefault: row.is_default,
  };
}

// ที่อยู่จัดส่งจริงของผู้ใช้ที่ล็อกอินอยู่ — RLS จำกัดให้เห็นเฉพาะของตัวเองอยู่แล้ว
// แต่ .eq("user_id", ...) ไว้ตรงๆ ด้วยเพื่อความชัดเจนของ query
export async function getAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("addresses")
    .select(
      "id, label, recipient_name, phone, address_line, subdistrict, district, province, postal_code, is_default",
    )
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("id");

  if (error || !data) return [];
  return data.map(mapAddress);
}
