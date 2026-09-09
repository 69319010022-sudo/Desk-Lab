// เชื่อมกับ Opn Payments (เดิมชื่อ Omise) REST API ตรงๆ จากฝั่งเซิร์ฟเวอร์เท่านั้น
// ใช้ secret key ยืนยันตัวตนแบบ HTTP Basic Auth (secret key เป็น username, password เว้นว่าง)
// เอกสารอ้างอิง: https://docs.opn.ooo/en/api

const OPN_API_BASE = "https://api.omise.co";

function authHeader(): string {
  const secretKey = process.env.OPN_SECRET_KEY;
  if (!secretKey) {
    throw new Error("ไม่พบ OPN_SECRET_KEY — ใส่ค่านี้ใน .env.local ก่อน (คีย์ที่ขึ้นต้นด้วย skey_test_...)");
  }
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

export type OpnChargeStatus = "pending" | "successful" | "failed" | "expired";

// พร้อมเพย์ QR ให้เวลาชำระ 30 นาทีนับจากตอนสร้าง charge — ค่า expires_at ที่ Opn ส่งกลับมาไม่ได้
// สะท้อนเวลาที่ QR นี้ใช้สแกนจ่ายได้จริง (เป็นเวลาหมดอายุของ charge resource โดยรวม ซึ่งยาวกว่ามาก)
// จึงกำหนดเวลาหมดอายุ QR เองจาก created_at ของ Opn โดยตรงแทน
export const PROMPTPAY_QR_VALID_SECONDS = 30 * 60;

export type OpnChargeResult = {
  chargeId: string;
  status: OpnChargeStatus;
  qrImageDataUri: string | null;
  // เวลาหมดอายุของ QR นี้ (ISO string) = created_at ฝั่ง Opn + PROMPTPAY_QR_VALID_SECONDS เพื่อให้
  // นับถอยหลังตรงกันทุกครั้งที่โหลดหน้าซ้ำ แทนที่จะรีเซ็ตเป็นเวลาเต็มใหม่ทุกครั้งที่ mount component
  expiresAt: string | null;
};

type OmiseChargeResponse = {
  object?: string;
  id: string;
  status: OpnChargeStatus;
  message?: string;
  authorize_uri?: string;
  created_at?: string;
  source?: {
    scannable_code?: {
      image?: {
        download_uri?: string;
      };
    };
  };
};

function toChargeResult(charge: OmiseChargeResponse): OpnChargeResult {
  const expiresAt = charge.created_at
    ? new Date(new Date(charge.created_at).getTime() + PROMPTPAY_QR_VALID_SECONDS * 1000).toISOString()
    : null;

  return {
    chargeId: charge.id,
    status: charge.status,
    qrImageDataUri: charge.source?.scannable_code?.image?.download_uri ?? null,
    expiresAt,
  };
}

// สร้าง PromptPay source + charge จริงกับ Opn Payments (โหมดทดสอบ/sandbox ใช้คีย์ที่ขึ้นต้น skey_test_)
// amountBaht: จำนวนเงินหน่วยบาท — Opn รับหน่วยสตางค์ (บาท x 100) ต้องแปลงก่อนส่ง
export async function createPromptPayCharge(
  amountBaht: number,
  description: string,
): Promise<OpnChargeResult> {
  const amountSatang = Math.round(amountBaht * 100);

  const sourceRes = await fetch(`${OPN_API_BASE}/sources`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      type: "promptpay",
      amount: String(amountSatang),
      currency: "thb",
    }),
  });
  const source = await sourceRes.json();
  if (!sourceRes.ok) {
    throw new Error("สร้าง PromptPay source ไม่สำเร็จ: " + (source?.message ?? sourceRes.statusText));
  }

  const chargeRes = await fetch(`${OPN_API_BASE}/charges`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      amount: String(amountSatang),
      currency: "thb",
      source: source.id,
      description,
    }),
  });
  const charge: OmiseChargeResponse = await chargeRes.json();
  if (!chargeRes.ok) {
    throw new Error("สร้าง charge ไม่สำเร็จ: " + (charge?.message ?? chargeRes.statusText));
  }

  return toChargeResult(charge);
}

export type OpnCardChargeResult = {
  chargeId: string;
  status: OpnChargeStatus;
  authorizeUri: string | null;
};

// สร้าง charge จากบัตรเครดิต/เดบิตด้วย token ที่ Omise.js สร้างไว้ฝั่งไคลเอนต์แล้ว (เลขบัตรจริง
// ไม่เคยผ่านเซิร์ฟเวอร์ของเราเลย — เป็นไปตามข้อกำหนด PCI) ส่วนใหญ่ในโหมดทดสอบจะได้ผลลัพธ์
// successful/failed ทันที แต่บางกรณี (บัตรทดสอบ 3-D Secure) จะได้ authorize_uri กลับมาให้พาลูกค้า
// ไปยืนยันตัวตนต่อที่หน้าธนาคารก่อน แล้ว Opn จะ redirect กลับมาที่ returnUri ที่ระบุไว้
export async function createCardCharge(
  amountBaht: number,
  description: string,
  cardToken: string,
  returnUri: string,
): Promise<OpnCardChargeResult> {
  const amountSatang = Math.round(amountBaht * 100);

  const chargeRes = await fetch(`${OPN_API_BASE}/charges`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      amount: String(amountSatang),
      currency: "thb",
      card: cardToken,
      description,
      return_uri: returnUri,
    }),
  });
  const charge: OmiseChargeResponse = await chargeRes.json();
  if (!chargeRes.ok) {
    throw new Error("สร้าง charge บัตรไม่สำเร็จ: " + (charge?.message ?? chargeRes.statusText));
  }

  return {
    chargeId: charge.id,
    status: charge.status,
    authorizeUri: charge.authorize_uri ?? null,
  };
}

// ตรวจสอบสถานะ charge ปัจจุบันกับ Opn ตรงๆ — ใช้แทน webhook ระหว่างพัฒนาบน localhost
// (localhost รับ webhook จริงจาก Opn ไม่ได้ ต้องมี public URL เช่น ngrok ถึงจะรับได้)
export async function getCharge(chargeId: string): Promise<OpnChargeResult> {
  const res = await fetch(`${OPN_API_BASE}/charges/${chargeId}`, {
    headers: { Authorization: authHeader() },
  });
  const charge: OmiseChargeResponse = await res.json();
  if (!res.ok) {
    throw new Error("ตรวจสอบสถานะไม่สำเร็จ: " + (charge?.message ?? res.statusText));
  }
  return toChargeResult(charge);
}
