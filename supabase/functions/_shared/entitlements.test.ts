import { assertEquals } from "jsr:@std/assert@1";
import { capabilityDenialStatus, decideCapability } from "./entitlements.ts";

const now = "2026-10-12T00:00:00.000Z";
const premium = {
  userId: "user-a",
  plan: "premium" as const,
  status: "active" as const,
  expiresAt: "2026-11-12T00:00:00.000Z",
};

Deno.test("basic guide is explicitly public", () => {
  assertEquals(decideCapability({ capability: "guide.basic", authenticatedUserId: null, entitlement: null, now }).allowed, true);
});

Deno.test("Premium capability requires authentication", () => {
  const d = decideCapability({ capability: "explore.advanced_sources", authenticatedUserId: null, entitlement: null, now });
  assertEquals(d.allowed, false);
  if (!d.allowed) assertEquals(d.reason, "authentication_required");
});

Deno.test("missing entitlement fails closed", () => {
  const d = decideCapability({ capability: "lifecycles.full", authenticatedUserId: "user-a", entitlement: null, now });
  assertEquals(d.allowed, false);
  if (!d.allowed) assertEquals(d.reason, "entitlement_unavailable");
});

Deno.test("client cannot borrow another user's entitlement", () => {
  const d = decideCapability({ capability: "insights.history", authenticatedUserId: "user-b", entitlement: premium, now });
  assertEquals(d.allowed, false);
  if (!d.allowed) assertEquals(d.reason, "entitlement_mismatch");
});

Deno.test("active Premium user is allowed", () => {
  const d = decideCapability({ capability: "explore.advanced_sources", authenticatedUserId: "user-a", entitlement: premium, now });
  assertEquals(d.allowed, true);
  if (d.allowed) assertEquals(d.reason, "active_premium");
});

Deno.test("Free plan is denied Premium capability", () => {
  const d = decideCapability({
    capability: "connection.comparison",
    authenticatedUserId: "user-a",
    entitlement: { ...premium, plan: "free" },
    now,
  });
  assertEquals(d.allowed, false);
  if (!d.allowed) assertEquals(d.reason, "premium_required");
});

Deno.test("expired Premium entitlement is denied", () => {
  const d = decideCapability({
    capability: "transits.advanced_analysis",
    authenticatedUserId: "user-a",
    entitlement: { ...premium, expiresAt: "2026-10-11T00:00:00.000Z" },
    now,
  });
  assertEquals(d.allowed, false);
  if (!d.allowed) assertEquals(d.reason, "expired_subscription");
});

Deno.test("grace status requires an unexpired grace deadline", () => {
  const d = decideCapability({
    capability: "lifecycles.full",
    authenticatedUserId: "user-a",
    entitlement: { ...premium, status: "grace", expiresAt: "2026-10-11T00:00:00.000Z", graceUntil: "2026-10-13T00:00:00.000Z" },
    now,
  });
  assertEquals(d.allowed, true);
});

Deno.test("unknown capability is denied", () => {
  const d = decideCapability({ capability: "admin.dump_database", authenticatedUserId: "user-a", entitlement: premium, now });
  assertEquals(d.allowed, false);
  assertEquals(capabilityDenialStatus(d), 400);
});

Deno.test("malformed time fails closed", () => {
  const d = decideCapability({ capability: "explore.advanced_sources", authenticatedUserId: "user-a", entitlement: premium, now: "not-a-date" });
  assertEquals(d.allowed, false);
});
