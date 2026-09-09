// ข้อมูลตัวอย่าง (mock) สำหรับขึ้นโครง Frontend ตาม Wireframe ก่อนเชื่อม Supabase จริง
// รูปร่างของ type อ้างอิงตาม schema ใน desklab_supabase_schema.sql

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  rating: number;
  reviewCount: number;
  images: string[];
};

export type Review = {
  id: number;
  productId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItemSummary = {
  productName: string;
  quantity: number;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItemSummary[];
};

export type CartLine = {
  product: Product;
  quantity: number;
};

export const categories: Category[] = [
  { id: 1, name: "โคมไฟ", slug: "lamp" },
  { id: 2, name: "แผ่นรองเมาส์", slug: "mousepad" },
  { id: 3, name: "ที่วางจอ", slug: "monitor-stand" },
  { id: 4, name: "ลำโพง", slug: "speaker" },
  { id: 5, name: "ที่วางหูฟัง", slug: "headphone-stand" },
];

export const products: Product[] = [
  {
    id: 1,
    categoryId: 1,
    name: "โคมไฟตั้งโต๊ะ LED ปรับแสง รุ่น DL-500",
    slug: "led-desk-lamp-dl-500",
    description:
      "โคมไฟ LED ปรับความสว่างและอุณหภูมิสีได้ 3 ระดับ พร้อมพอร์ตชาร์จ USB ในตัว รองรับการวางมุมได้หลากหลาย เหมาะสำหรับโต๊ะทำงานและโต๊ะคอมพิวเตอร์",
    price: 590,
    stockQuantity: 42,
    sku: "DL-MONO-AL01",
    rating: 4.5,
    reviewCount: 48,
    images: [],
  },
  {
    id: 2,
    categoryId: 2,
    name: "แผ่นรองเมาส์ผ้า XL กันลื่น",
    slug: "fabric-mousepad-xl",
    description: "แผ่นรองเมาส์ผืนใหญ่เนื้อผ้าละเอียด ขอบเย็บกันลุ่ย ผิวลื่นเหมาะกับการใช้งานเกมและทำงาน",
    price: 390,
    stockQuantity: 65,
    sku: "DL-PAD-XL02",
    rating: 4.7,
    reviewCount: 31,
    images: [],
  },
  {
    id: 3,
    categoryId: 3,
    name: "ที่วางจอปรับระดับ Aluminum",
    slug: "monitor-stand-aluminum",
    description:
      "ขาตั้งจอมอนิเตอร์วัสดุอลูมิเนียม ปรับความสูงได้ 360 องศา รองรับน้ำหนักได้สูงสุด 32 กก. และเพิ่มพื้นที่ใต้โต๊ะให้เป็นระเบียบมากขึ้น",
    price: 1290,
    stockQuantity: 18,
    sku: "DL-MONO-AL01-STAND",
    rating: 4.6,
    reviewCount: 48,
    images: [],
  },
  {
    id: 4,
    categoryId: 4,
    name: "ลำโพงบลูทูธมินิสำหรับโต๊ะทำงาน",
    slug: "mini-bluetooth-speaker",
    description: "ลำโพงบลูทูธขนาดเล็ก เสียงใส เบสแน่น แบตอึดใช้งานต่อเนื่องได้นานถึง 10 ชั่วโมง",
    price: 890,
    stockQuantity: 27,
    sku: "DL-SPK-MINI03",
    rating: 4.4,
    reviewCount: 19,
    images: [],
  },
  {
    id: 5,
    categoryId: 5,
    name: "ที่วางหูฟังไม้ธรรมชาติ",
    slug: "wood-headphone-stand",
    description: "ที่วางหูฟังทำจากไม้แท้ ฐานกันลื่น ดีไซน์เรียบง่ายเข้ากับโต๊ะทำงานทุกสไตล์",
    price: 450,
    stockQuantity: 33,
    sku: "DL-HPS-WD04",
    rating: 4.3,
    reviewCount: 12,
    images: [],
  },
  {
    id: 6,
    categoryId: 1,
    name: "คีย์บอร์ดเมคานิคอล 65%",
    slug: "mechanical-keyboard-65",
    description: "คีย์บอร์ดเมคานิคอลขนาดกะทัดรัด สวิตช์เสียงหนึบ พิมพ์สบายมือ พร้อมไฟ RGB ปรับได้",
    price: 1990,
    stockQuantity: 15,
    sku: "DL-KB-65PCT05",
    rating: 4.8,
    reviewCount: 64,
    images: [],
  },
  {
    id: 7,
    categoryId: 4,
    name: "ที่ชาร์จไร้สาย 15W",
    slug: "wireless-charger-15w",
    description: "แท่นชาร์จไร้สายกำลังไฟ 15W ชาร์จเร็ว รองรับสมาร์ตโฟนทุกรุ่นที่ใช้ Qi",
    price: 590,
    stockQuantity: 50,
    sku: "DL-CHG-15W06",
    rating: 4.2,
    reviewCount: 22,
    images: [],
  },
  {
    id: 8,
    categoryId: 3,
    name: "ปลั๊กพ่วง USB ตั้งโต๊ะ",
    slug: "usb-power-strip",
    description: "ปลั๊กพ่วงพร้อมช่อง USB 4 พอร์ต ยึดติดขอบโต๊ะได้ ช่วยจัดสายไฟให้เป็นระเบียบ",
    price: 690,
    stockQuantity: 40,
    sku: "DL-PWR-USB07",
    rating: 4.1,
    reviewCount: 9,
    images: [],
  },
];

export const reviews: Review[] = [
  {
    id: 1,
    productId: 3,
    authorName: "สมชาย ส.",
    rating: 5,
    comment:
      "วัสดุหนาสมราคา ติดตั้งง่าย ประหยัดพื้นที่บนโต๊ะไปได้เยอะ จอลอยขึ้นได้โล่งขึ้นเยอะเลยครับ",
    createdAt: "15 ก.พ. 2569",
  },
  {
    id: 2,
    productId: 3,
    authorName: "มินตรา พ.",
    rating: 4,
    comment: "ใช้งานได้ดีมาก ปรับองศาง่ายแต่แน่น ส่งของไวพนักงานบริการดี",
    createdAt: "10 ม.ค. 2569",
  },
  {
    id: 3,
    productId: 3,
    authorName: "อนุชา ท.",
    rating: 4,
    comment: "โดยรวมพอใจ มีจุดที่น็อตหลวมนิดหน่อยตอนแกะกล่อง แต่ขันเพิ่มก็ใช้ได้ปกติ",
    createdAt: "2 ม.ค. 2569",
  },
];

// โหมดผู้ใช้งานจริง: บัญชีใหม่ยังไม่มีประวัติคำสั่งซื้อ (โครง UI ของหน้า order-history
// ยังอยู่ครบตาม Wireframe — ดู empty state ที่ src/app/(site)/account/orders/page.tsx)
export const orders: Order[] = [];

export const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "รอชำระเงิน",
  paid: "ชำระเงินแล้ว",
  processing: "รอจัดส่ง",
  shipped: "จัดส่งแล้ว",
  delivered: "จัดส่งสำเร็จ",
  cancelled: "ยกเลิกแล้ว",
};

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategoryById(id: number): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getRelatedProducts(product: Product, count = 4): Product[] {
  return products.filter((p) => p.id !== product.id).slice(0, count);
}

export function formatBaht(amount: number): string {
  return `฿${amount.toLocaleString("th-TH")}`;
}
