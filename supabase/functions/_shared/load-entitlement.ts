import type { SupabaseClient } from "npm:@supabase/supabase-js@2.57.0";
import type { TrustedEntitlement } from "./entitlements.ts";

export type EntitlementLookup =
  | { ok: true; entitlement: TrustedEntitlement }
  | { ok: false; reason: "lookup_failed" };

/**
 * Load entitlement from the server-managed table using a Supabase client whose
 * Authorization header is already bound to the verified user's JWT.
 *
 * A missing row is the Free plan. A query error is NOT Free and NOT Premium:
 * callers must deny Premium capabilities (fail closed). The client must never
 * pass plan/status values into this function.
 */
export async function loadTrustedEntitlement(
  supabase: SupabaseClient,
  authenticatedUserId: string,
): Promise<EntitlementLookup> {
  try {
    const { data, error } = await supabase
      .from("ky_entitlements")
      .select("user_id,plan,status,expires_at,grace_until")
      .eq("user_id", authenticatedUserId)
      .maybeSingle();

    if (error) return { ok: false, reason: "lookup_failed" };
    if (!data) {
      return {
        ok: true,
        entitlement: { userId: authenticatedUserId, plan: "free", status: "active" },
      };
    }

    if (data.user_id !== authenticatedUserId ||
        !["free", "premium"].includes(data.plan) ||
        !["active", "trialing", "grace", "expired", "canceled", "unknown"].includes(data.status)) {
      return { ok: false, reason: "lookup_failed" };
    }

    return {
      ok: true,
      entitlement: {
        userId: data.user_id,
        plan: data.plan,
        status: data.status,
        expiresAt: data.expires_at,
        graceUntil: data.grace_until,
      },
    };
  } catch {
    return { ok: false, reason: "lookup_failed" };
  }
}
