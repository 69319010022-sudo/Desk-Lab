// สคริปต์ชั่วคราวสร้างไฟล์ desklab_backup.db จาก schema.sql (ใช้ node:sqlite ในตัว Node.js ไม่ต้องติดตั้งอะไรเพิ่ม)
import { DatabaseSync } from "node:sqlite";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const dbPath = join(dir, "desklab_backup.db");
const sqlPath = join(dir, "schema.sql");

if (existsSync(dbPath)) unlinkSync(dbPath);

const db = new DatabaseSync(dbPath);
const sql = readFileSync(sqlPath, "utf-8");
db.exec(sql);

const rows = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
console.log("TABLES:", rows.length);
for (const r of rows) console.log(" -", r.name);

db.close();
