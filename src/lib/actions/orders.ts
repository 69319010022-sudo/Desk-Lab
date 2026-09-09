"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { fireAndForgetLog } from "@/lib/actions/logging";
import { createCardCharge } from "@/lib/payments/opn";
import { getCart } from "@/lib/data/cart";
import { getOrCreateCartId } from "@/lib/actions/cart";

export type OrderActionState = { error?: string } | null;

const ALLOWED_PAYMENT_METHODS = ["promptpay", "credit_card", "cod"] as const;
type PaymentMethodInput = (typeof ALLOWED_PAYMENT_METHODS)[number];

// สร้างคำสั่งซื้อจริงจากตะกร้า + ที่อยู่ที่เลือกตอนกด "ยืนยันคำสั่งซื้อ" ที่หน้า checkout
export async function createOrderAction(
  _prevState: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const addressId = Number(formData.get("addressId"));
  if (!addressId) return { error: "กรุณาเลือกที่อยู่จัดส่ง" };

  const paymentMethodRaw = String(formData.get("paymentMethod") ?? "");
  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethodRaw as PaymentMethodInput)) {
    return { error: "กรุณาเลือกวิธีการชำระเงิน" };
  }
  const paymentMethod = paymentMethodRaw as PaymentMethodInput;

  // เช็คว่าที่อยู่นี้เป็นของผู้ใช้จริง (RLS กันไว้อีกชั้นอยู่แล้ว แต่เช็คตรงนี้เพื่อโชว์ error ที่เข้าใจง่ายกว่า)
  const { data: address } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!address) return { error: "ไม่พบที่อยู่จัดส่งที่เลือก" };

  const cart = await getCart();
  if (cart.items.length === 0 || !cart.cartId) {
    return { error: "ตะกร้าสินค้าว่างเปล่า" };
  }

  // เช็คสต็อกอีกรอบฝั่งเซิร์ฟเวอร์ก่อนสร้างคำสั่งซื้อ กันกรณีสินค้าหมดระหว่างที่ค้างอยู่ในตะกร้า
  const outOfStock = cart.items.find((item) => item.quantity > item.product.stockQuantity);
  if (outOfStock) {
    return { error: `สินค้า "${outOfStock.product.name}" มีไม่พอ กรุณาปรับจำนวนในตะกร้าก่อน` };
  }

  const totalAmount = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // ชำระเงินปลายทาง (COD) ไม่มีขั้นตอนรอชำระเงินล่วงหน้าเหมือนวิธีอื่น — เริ่มออเดอร์ที่สถานะ
  // "processing" (แสดงผลเป็น "รอจัดส่ง") ไปเลย ข้ามสถานะ "pending"/"paid" เพราะลูกค้าจ่ายตอนได้รับของ
  const initialOrderStatus = paymentMethod === "cod" ? "processing" : "pending";

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressId,
      order_status: initialOrderStatus,
      total_amount: totalAmount,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "สร้างคำสั่งซื้อไม่สำเร็จ: " + (orderError?.message ?? "unknown error") };
  }

  const orderItemsPayload = cart.items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);
  if (itemsError) {
    // order_items ล้มเหลว — ลบ order ที่สร้างไปแล้วทิ้ง กันไม่ให้ค้างเป็นออเดอร์เปล่า
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "บันทึกรายการสินค้าไม่สำเร็จ: " + itemsError.message };
  }

  // ตัดสต็อกสินค้าจริงผ่าน Postgres function (SECURITY DEFINER) — RLS ของ products ให้ authenticated
  // อ่านได้อย่างเดียว เขียนไม่ได้ (กันผู้ใช้แก้ราคา/สต็อกเอง) ฟังก์ชันนี้เช็คสต็อกพอ+ตัดแบบอะตอมิก
  // ต่อแถวใน UPDATE เดียว กันสต็อกติดลบถ้ามีคนสั่งพร้อมกัน (ดู desklab_stock_decrement_migration.sql)
  const { error: stockError } = await supabase.rpc("decrement_order_stock", {
    p_order_id: order.id,
  });
  if (stockError) {
    // สต็อกไม่พอ (หรือ error อื่น) — ลบ order_items + order ที่สร้างไปแล้วทิ้ง กันค้างเป็นออเดอร์เปล่า
    await supabase.from("order_items").delete().eq("order_id", order.id);
    await supabase.from("orders").delete().eq("id", order.id);
    return { error: "สินค้าบางรายการมีไม่พอแล้ว กรุณาปรับจำนวนในตะกร้าแล้วลองใหม่อีกครั้ง" };
  }

  // สร้างแถวการชำระเงินคู่กับออเดอร์เสมอ — payments เขียนได้เฉพาะผ่าน service client เท่านั้น
  // (RLS ตั้งใจล็อกไม่ให้ authenticated ทั่วไปเขียน payments เอง กันลูกค้าปลอมสถานะจ่ายเงิน)
  const serviceClient = createServiceClient();
  const { error: paymentInsertError } = await serviceClient.from("payments").insert({
    order_id: order.id,
    payment_method: paymentMethod,
    payment_status: "pending",
    amount: totalAmount,
  });
  if (paymentInsertError) {
    // ออเดอร์สร้างสำเร็จแล้ว แค่บันทึกแถวชำระเงินไม่สำเร็จ — ไม่ rollback ออเดอร์ทิ้ง แค่ log ไว้ ผู้ใช้ยัง
    // เห็นออเดอร์ในประวัติได้ปกติ (กรณีนี้ไม่ควรเกิดถ้า schema/สิทธิ์ถูกต้อง)
    console.error("บันทึก payments ไม่สำเร็จ:", paymentInsertError.message);
  }

  // บัตรเครดิต/เดบิต: เก็บ token ที่ Omise.js สร้างไว้ฝั่งไคลเอนต์แล้ว (เลขบัตรจริงไม่เคยมาถึงเซิร์ฟเวอร์เรา)
  // แล้วยิง charge กับ Opn ทันที ปกติจะรู้ผลสำเร็จ/ล้มเหลวทันที (ไม่เหมือนพร้อมเพย์ที่ต้องรอลูกค้าไปจ่ายทีหลัง)
  let cardChargeStatus: string | null = null;
  let cardAuthorizeUri: string | null = null;

  if (paymentMethod === "credit_card") {
    const cardToken = String(formData.get("cardToken") ?? "");
    if (!cardToken) {
      await serviceClient.from("payments").delete().eq("order_id", order.id);
      await supabase.from("orders").delete().eq("id", order.id);
      return { error: "ไม่พบข้อมูลบัตรที่ยืนยันแล้ว กรุณาลองใหม่อีกครั้ง" };
    }

    const hdrs = await headers();
    const host = hdrs.get("host");
    const proto = hdrs.get("x-forwarded-proto") ?? "https";
    const origin = host ? `${proto}://${host}` : "";

    try {
      const charge = await createCardCharge(
        totalAmount,
        `DeskLab Order #${order.id}`,
        cardToken,
        `${origin}/checkout/card/${order.id}/complete`,
      );
      await serviceClient
        .from("payments")
        .update({ transaction_ref: charge.chargeId })
        .eq("order_id", order.id);
      cardChargeStatus = charge.status;
      cardAuthorizeUri = charge.authorizeUri;

      if (charge.status === "successful") {
        await serviceClient
          .from("payments")
          .update({ payment_status: "success", paid_at: new Date().toISOString() })
          .eq("order_id", order.id);
        await serviceClient.from("orders").update({ order_status: "paid" }).eq("id", order.id);
      } else if (!(charge.status === "pending" && charge.authorizeUri)) {
        // ไม่สำเร็จ และไม่ใช่กรณีรอยืนยันตัวตน 3-D Secure — ถือว่าล้มเหลว ยกเลิกออเดอร์ทิ้งให้ลองใหม่
        await serviceClient.from("payments").delete().eq("order_id", order.id);
        await supabase.from("orders").delete().eq("id", order.id);
        return { error: "การชำระเงินด้วยบัตรไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรแล้วลองใหม่อีกครั้ง" };
      }
    } catch (err) {
      await serviceClient.from("payments").delete().eq("order_id", order.id);
      await supabase.from("orders").delete().eq("id", order.id);
      return {
        error: "เชื่อมต่อระบบชำระเงินไม่สำเร็จ: " + (err instanceof Error ? err.message : "unknown error"),
      };
    }
  }

  await supabase.from("cart_items").delete().eq("cart_id", cart.cartId);

  // Log order creation
  fireAndForgetLog(user.id, "order.created", "orders", order.id, {
    paymentMethod,
    totalAmount,
    itemCount: cart.items.length,
  });

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/account/orders");
  revalidatePath("/", "layout");

  // บัตรที่ต้องยืนยันตัวตนเพิ่มเติม (3-D Secure) — พาลูกค้าไปหน้าธนาคารก่อน แล้วจะถูก redirect
  // กลับมาที่ /checkout/card/[orderId]/complete ให้เอง
  if (paymentMethod === "credit_card" && cardChargeStatus === "pending" && cardAuthorizeUri) {
    redirect(cardAuthorizeUri);
  }

  // พร้อมเพย์: พาไปหน้าสร้าง/แสดง QR จริงแทนที่จะไปหน้าประวัติคำสั่งซื้อเลย
  if (paymentMethod === "promptpay") {
    redirect(`/checkout/promptpay/${order.id}`);
  }

  redirect("/account/orders?success=1");
}

// ยกเลิกคำสั่งซื้อของตัวเอง — ทำได้เฉพาะตอนสถานะยังเป็น "รอชำระเงิน" (pending) เท่านั้น
// (RLS มี policy orders_update_own_cancel กันซ้ำอีกชั้นฝั่งฐานข้อมูล)
export async function cancelOrderAction(orderId: number, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("orders")
    .update({ order_status: "cancelled", cancel_reason: reason })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("order_status", "pending");

  // Log order cancellation if successful
  if (!error) {
    fireAndForgetLog(user.id, "order.cancelled", "orders", orderId, { reason });
  }

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
}
export type ReorderState = { error?: string } | null;

type ReorderItemRow = {
  quantity: number;
  products: { id: number; stock_quantity: number; is_active: boolean } | null;
};

// สั่งซื้อสินค้าในคำสั่งซื้อเดิมอีกครั้ง (เช่นออเดอร์ที่ยกเลิกไปแล้ว) — เพิ่มสินค้าที่ยังมีขาย
// และมีสต็อกพอกลับเข้าตะกร้า แล้วพาไปหน้าตะกร้าให้ตรวจสอบก่อนสั่งซื้อจริงอีกที
export async function reorderAction(orderId: number): Promise<ReorderState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // เช็คว่า order นี้เป็นของผู้ใช้จริง (RLS กันไว้อีกชั้นอยู่แล้ว)
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) return { error: "ไม่พบคำสั่งซื้อนี้" };

  const { data: orderItems, error } = await supabase
    .from("order_items")
    .select("quantity, products(id, stock_quantity, is_active)")
    .eq("order_id", orderId);

  if (error || !orderItems) return { error: "ไม่พบรายการสินค้าของคำสั่งซื้อนี้" };

  const cartId = await getOrCreateCartId(supabase, user.id);

  let addedCount = 0;
  for (const item of orderItems as unknown as ReorderItemRow[]) {
    const product = item.products;
    if (!product || !product.is_active || product.stock_quantity <= 0) continue;

    const quantity = Math.min(item.quantity, product.stock_quantity);

    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("product_id", product.id)
      .maybeSingle();

    if (existingItem) {
      await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);
    } else {
      await supabase.from("cart_items").insert({ cart_id: cartId, product_id: product.id, quantity });
    }
    addedCount++;
  }

  if (addedCount === 0) {
    return { error: "สินค้าทั้งหมดในคำสั่งซื้อนี้หมดสต็อกหรือไม่มีจำหน่ายแล้ว" };
  }

  // Log reorder action
  fireAndForgetLog(user.id, "order.reordered", "orders", orderId, { addedCount });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/cart");
}