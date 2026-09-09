import type { Metadata } from "next";
import { Prompt, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// โหลดฟอนต์จริงตามดีไซน์ Figma (POS-style UI): Prompt สำหรับข้อความไทย/UI ทั่วไป,
// IBM Plex Mono สำหรับตัวเลข (ราคา/จำนวน/ยอดรวม) ทุกจุดตามหลักการที่ตกลงไว้ —
// เดิมเคยตกลงมาใช้ system font stack ไปก่อนเพราะ sandbox ของ Claude ดึง Google Fonts
// ตอน build ไม่ได้ ตอนนี้แก้ไฟล์ตรงบนเครื่องผู้ใช้ที่มีเน็ตจริง เลยเปิดใช้ next/font/google ได้เลย
const prompt = Prompt({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-prompt",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeskLab — ของแต่งโต๊ะคอมพิวเตอร์",
  description: "ร้านขายของแต่งโต๊ะคอมพิวเตอร์ออนไลน์ พร้อมโปรแกรมจำลองการจัดโต๊ะ",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`h-full antialiased ${prompt.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-full flex flex-col bg-background text-ink">
        {children}
      </body>
    </html>
  );
}
