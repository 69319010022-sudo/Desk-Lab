"use server";

import { createServiceClient } from "@/lib/supabase/service";

export type ActivityAction =
  | "auth.signed_in"
  | "auth.signed_up"
  | "auth.signed_out"
  | "auth.password_changed"
  | "order.created"
  | "order.cancelled"
  | "order.reordered"
  | "payment.charged"
  | "payment.failed"
  | "profile.updated"
  | "profile.avatar_uploaded"
  | "profile.avatar_deleted";

/**
 * Log an activity to the activity_logs table
 * Uses service role to bypass RLS so logs are always written
 * Silently fails if logging fails (non-blocking)
 */
export async function logActivity(
  userId: string | null,
  action: ActivityAction,
  entityType: string,
  entityId: string | number,
  metadata?: Record<string, unknown>,
) {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("activity_logs").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId.toString(),
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`[ActivityLog] Failed to log ${action}:`, error.message);
    }
  } catch (err) {
    console.error(`[ActivityLog] Unexpected error logging ${action}:`, err);
  }
}

/**
 * Fire-and-forget logging wrapper
 * Initiates async logging without waiting for completion
 * Prevents logging failures from affecting main operations
 */
export async function fireAndForgetLog(
  userId: string | null,
  action: ActivityAction,
  entityType: string,
  entityId: string | number,
  metadata?: Record<string, unknown>,
) {
  // Fire the log asynchronously without awaiting
  logActivity(userId, action, entityType, entityId, metadata).catch(() => {
    // Silently fail
  });
}
