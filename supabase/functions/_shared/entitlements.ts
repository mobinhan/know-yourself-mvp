/**
 * KY server-side Premium capability policy.
 *
 * This is a pure policy module: callers MUST obtain user identity from verified
 * server authentication and entitlement from a trusted server-side source.
 * Never pass request-body/client tier claims as entitlement evidence.
 *
 * A decision of "allow" is not authentication. Route handlers must authenticate
 * first, load entitlement server-side, call this function, and only then retrieve
 * protected data or invoke an AI provider.
 */
export const CAPABILITIES = Object.freeze({
  "guide.basic": "free",
  "explore.advanced_sources": "premium",
  "transits.advanced_analysis": "premium",
  "lifecycles.full": "premium",
  "insights.history": "premium",
  "insights.pattern_recognition": "premium",
  "connection.comparison": "premium",
} as const);

export type Capability = keyof typeof CAPABILITIES;
export type Plan = "free" | "premium";

export interface TrustedEntitlement {
  userId: string;
  plan: Plan;
  status: "active" | "trialing" | "grace" | "expired" | "canceled" | "unknown";
  expiresAt?: string | null;
  graceUntil?: string | null;
}

export type CapabilityDecision =
  | { allowed: true; capability: Capability; reason: "public_basic" | "active_premium" }
  | {
      allowed: false;
      capability: Capability;
      reason: "authentication_required" | "entitlement_unavailable" |
        "entitlement_mismatch" | "inactive_subscription" | "expired_subscription" |
        "premium_required" | "unknown_capability";
    };

const PREMIUM_ACTIVE_STATES = new Set(["active", "trialing"]);
const PREMIUM_GRACE_STATES = new Set(["grace"]);

export function decideCapability(input: {
  capability: string;
  authenticatedUserId: string | null | undefined;
  entitlement: TrustedEntitlement | null | undefined;
  now?: string;
}): CapabilityDecision {
  const { capability, authenticatedUserId, entitlement } = input;
  if (!Object.hasOwn(CAPABILITIES, capability)) {
    return { allowed: false, capability: capability as Capability, reason: "unknown_capability" };
  }
  const requiredPlan = CAPABILITIES[capability as Capability];

  // Basic public-guide material can be served without an account only if the
  // caller's route separately restricts the payload to explicitly public data.
  if (requiredPlan === "free") {
    return { allowed: true, capability: capability as Capability, reason: "public_basic" };
  }
  if (!authenticatedUserId) {
    return { allowed: false, capability: capability as Capability, reason: "authentication_required" };
  }
  if (!entitlement) {
    return { allowed: false, capability: capability as Capability, reason: "entitlement_unavailable" };
  }
  if (entitlement.userId !== authenticatedUserId) {
    return { allowed: false, capability: capability as Capability, reason: "entitlement_mismatch" };
  }

  const nowMs = Date.parse(input.now ?? new Date().toISOString());
  if (!Number.isFinite(nowMs)) {
    return { allowed: false, capability: capability as Capability, reason: "entitlement_unavailable" };
  }
  const expiryMs = entitlement.expiresAt ? Date.parse(entitlement.expiresAt) : null;
  const graceMs = entitlement.graceUntil ? Date.parse(entitlement.graceUntil) : null;
  if (expiryMs !== null && (!Number.isFinite(expiryMs) || expiryMs <= nowMs) &&
      !(entitlement.status === "grace" && graceMs !== null && Number.isFinite(graceMs) && graceMs > nowMs)) {
    return { allowed: false, capability: capability as Capability, reason: "expired_subscription" };
  }
  if (entitlement.status === "grace" && !(graceMs !== null && Number.isFinite(graceMs) && graceMs > nowMs)) {
    return { allowed: false, capability: capability as Capability, reason: "expired_subscription" };
  }
  if (!PREMIUM_ACTIVE_STATES.has(entitlement.status) &&
      !PREMIUM_GRACE_STATES.has(entitlement.status)) {
    return { allowed: false, capability: capability as Capability, reason: "inactive_subscription" };
  }
  if (entitlement.plan !== "premium") {
    return { allowed: false, capability: capability as Capability, reason: "premium_required" };
  }
  return { allowed: true, capability: capability as Capability, reason: "active_premium" };
}

/** Safe public response: do not disclose whether protected records exist. */
export function capabilityDenialStatus(decision: CapabilityDecision): number {
  if (decision.allowed) return 200;
  if (decision.reason === "authentication_required") return 401;
  if (decision.reason === "unknown_capability") return 400;
  return 403;
}
