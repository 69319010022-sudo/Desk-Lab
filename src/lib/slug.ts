// Helper สร้าง slug จากข้อความไทย/อังกฤษ — ใช้ร่วมกันระหว่างฟอร์มเพิ่ม/แก้ไขสินค้าและ
// หมวดหมู่ใน Admin Dashboard (ขั้นตอนที่ 6) เพื่อไม่ต้องเขียนซ้ำ
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
