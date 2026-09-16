// Multi-DB Step 3 (MongoDB) — placeholder collection structure only.
// Maps the 11 relational tables in desklab-schema.md into 7 MongoDB
// collections (embed vs. reference decisions documented in desklab-plan.md).
// No data is inserted. Not connected to the Next.js app.

import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "desklab_backup";

const client = new MongoClient(uri);

// ---- $jsonSchema validators (approximate the SQL CHECK/ENUM constraints) ----

const usersSchema = {
  bsonType: "object",
  required: ["email"],
  properties: {
    name: { bsonType: ["string", "null"] },
    email: { bsonType: "string" },
    phone: { bsonType: ["string", "null"] },
    avatar_url: { bsonType: ["string", "null"] },
    role: { enum: ["customer", "admin"] },
    created_at: { bsonType: "date" },
    addresses: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          label: { bsonType: "string" },
          recipient_name: { bsonType: "string" },
          phone: { bsonType: "string" },
          address_line: { bsonType: "string" },
          subdistrict: { bsonType: "string" },
          district: { bsonType: "string" },
          province: { bsonType: "string" },
          postal_code: { bsonType: "string" },
          is_default: { bsonType: "bool" },
        },
      },
    },
  },
};

const categoriesSchema = {
  bsonType: "object",
  required: ["name"],
  properties: {
    name: { bsonType: "string" },
    slug: { bsonType: "string" },
  },
};

const productsSchema = {
  bsonType: "object",
  required: ["name", "price"],
  properties: {
    name: { bsonType: "string" },
    slug: { bsonType: "string" },
    description: { bsonType: ["string", "null"] },
    price: { bsonType: ["double", "decimal", "int"] },
    stock: { bsonType: "int" },
    sku: { bsonType: ["string", "null"] },
    is_active: { bsonType: "bool" },
    category_id: { bsonType: ["objectId", "null"] },
    images: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          url: { bsonType: "string" },
          alt_text: { bsonType: ["string", "null"] },
          sort_order: { bsonType: "int" },
        },
      },
    },
  },
};

const cartsSchema = {
  bsonType: "object",
  required: ["user_id"],
  properties: {
    user_id: { bsonType: "objectId" },
    items: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          product_id: { bsonType: "objectId" },
          quantity: { bsonType: "int" },
          unit_price: { bsonType: ["double", "decimal", "int"] },
        },
      },
    },
  },
};

const ordersSchema = {
  bsonType: "object",
  required: ["user_id", "order_status", "total_amount"],
  properties: {
    user_id: { bsonType: "objectId" },
    order_status: {
      enum: ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
    },
    total_amount: { bsonType: ["double", "decimal", "int"] },
    shipping_address: {
      bsonType: "object",
      properties: {
        recipient_name: { bsonType: "string" },
        phone: { bsonType: "string" },
        address_line: { bsonType: "string" },
        subdistrict: { bsonType: "string" },
        district: { bsonType: "string" },
        province: { bsonType: "string" },
        postal_code: { bsonType: "string" },
      },
    },
    items: {
      bsonType: "array",
      items: {
        bsonType: "object",
        properties: {
          product_id: { bsonType: "objectId" },
          product_name: { bsonType: "string" },
          quantity: { bsonType: "int" },
          unit_price: { bsonType: ["double", "decimal", "int"] },
        },
      },
    },
    created_at: { bsonType: "date" },
    cancel_reason: { bsonType: ["string", "null"] },
  },
};

const paymentsSchema = {
  bsonType: "object",
  required: ["order_id", "payment_method", "payment_status"],
  properties: {
    order_id: { bsonType: "objectId" },
    payment_method: { enum: ["promptpay", "credit_card", "bank_transfer", "cod"] },
    payment_status: { enum: ["pending", "success", "failed"] },
    amount: { bsonType: ["double", "decimal", "int"] },
    paid_at: { bsonType: ["date", "null"] },
  },
};

const reviewsSchema = {
  bsonType: "object",
  required: ["user_id", "product_id", "rating"],
  properties: {
    user_id: { bsonType: "objectId" },
    product_id: { bsonType: "objectId" },
    rating: { bsonType: "int", minimum: 1, maximum: 5 },
    comment: { bsonType: ["string", "null"] },
    created_at: { bsonType: "date" },
  },
};

// ตารางที่ 12 (เพิ่มทีหลัง 2026-09-14) — audit trail จากฟีเจอร์ Activity Logging
// เก็บเป็น collection แยกต่างหาก ไม่ embed เข้า users เพราะ log โตไม่จำกัด
// และเป็นของระบบ ไม่ใช่ของผู้ใช้คนเดียว
const activityLogsSchema = {
  bsonType: "object",
  required: ["action"],
  properties: {
    user_id: { bsonType: ["objectId", "null"] },
    action: { bsonType: "string" },
    entity_type: { bsonType: ["string", "null"] },
    entity_id: { bsonType: ["string", "null"] },
    metadata: { bsonType: "object" },
    created_at: { bsonType: "date" },
  },
};

const collections = [
  { name: "users", schema: usersSchema },
  { name: "categories", schema: categoriesSchema },
  { name: "products", schema: productsSchema },
  { name: "carts", schema: cartsSchema },
  { name: "orders", schema: ordersSchema },
  { name: "payments", schema: paymentsSchema },
  { name: "reviews", schema: reviewsSchema },
  { name: "activity_logs", schema: activityLogsSchema },
];

async function main() {
  await client.connect();
  const db = client.db(dbName);

  const existing = (await db.listCollections().toArray()).map((c) => c.name);

  for (const { name, schema } of collections) {
    if (existing.includes(name)) {
      // Drop and recreate so re-running this script is safe (placeholder DB, no data).
      await db.collection(name).drop();
    }
    await db.createCollection(name, {
      validator: { $jsonSchema: schema },
      validationLevel: "moderate",
    });
    console.log("created:", name);
  }

  const finalList = (await db.listCollections().toArray()).map((c) => c.name).sort();
  console.log("TOTAL COLLECTIONS:", finalList.length);
  for (const n of finalList) console.log(" -", n);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
