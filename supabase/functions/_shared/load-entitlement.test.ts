import { assertEquals } from "jsr:@std/assert@1";
import { loadTrustedEntitlement } from "./load-entitlement.ts";

function fakeClient(result: { data: unknown; error: unknown }) {
  return {
    from(table: string) {
      assertEquals(table, "ky_entitlements");
      return {
        select(columns: string) {
          assertEquals(columns, "user_id,plan,status,expires_at,grace_until");
          return {
            eq(column: string, userId: string) {
              assertEquals(column, "user_id");
              assertEquals(userId, "user-a");
              return { maybeSingle: async () => result };
            },
          };
        },
      };
    },
  } as never;
}

Deno.test("missing entitlement row defaults to Free, never Premium", async () => {
  const result = await loadTrustedEntitlement(fakeClient({ data: null, error: null }), "user-a");
  assertEquals(result, { ok: true, entitlement: { userId: "user-a", plan: "free", status: "active" } });
});

Deno.test("database error fails closed rather than granting Free or Premium", async () => {
  const result = await loadTrustedEntitlement(fakeClient({ data: null, error: new Error("db unavailable") }), "user-a");
  assertEquals(result, { ok: false, reason: "lookup_failed" });
});

Deno.test("valid server-managed Premium row is mapped", async () => {
  const result = await loadTrustedEntitlement(fakeClient({
    data: { user_id: "user-a", plan: "premium", status: "active", expires_at: "2026-11-12T00:00:00Z", grace_until: null },
    error: null,
  }), "user-a");
  assertEquals(result, {
    ok: true,
    entitlement: {
      userId: "user-a",
      plan: "premium",
      status: "active",
      expiresAt: "2026-11-12T00:00:00Z",
      graceUntil: null,
    },
  });
});

Deno.test("unexpected row identity or status fails closed", async () => {
  const result = await loadTrustedEntitlement(fakeClient({
    data: { user_id: "user-b", plan: "premium", status: "active", expires_at: null, grace_until: null },
    error: null,
  }), "user-a");
  assertEquals(result, { ok: false, reason: "lookup_failed" });
});
