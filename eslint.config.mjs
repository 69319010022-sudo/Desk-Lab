import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // โฟลเดอร์เก็บไฟล์อ้างอิงดิบจาก Claude (ยังไม่ได้ปรับให้เข้ากับโปรเจกต์จริง)
    // ไม่ใช่ส่วนหนึ่งของแอป ไม่ต้อง lint
    "Claude outputs/**",
    // Skills reference repo เก็บไว้อ้างอิง ไม่ใช่โค้ดของแอป ไม่ต้อง lint
    "agent-skills-main/**",
  ]),
]);

export default eslintConfig;
