from datetime import datetime, timezone
import unittest

from api.entitlements import decide_capability


NOW = datetime(2026, 10, 12, tzinfo=timezone.utc)
PREMIUM = {
    "user_id": "user-a",
    "plan": "premium",
    "status": "active",
    "expires_at": "2026-11-12T00:00:00Z",
    "grace_until": None,
}


class EntitlementPolicyTests(unittest.TestCase):
    def test_basic_guide_is_public(self):
        self.assertTrue(decide_capability("guide.basic", None, None, NOW)["allowed"])

    def test_unknown_capability_denied(self):
        self.assertEqual(decide_capability("toString", "user-a", PREMIUM, NOW)["status"], 400)

    def test_premium_requires_authentication(self):
        self.assertEqual(decide_capability("explore.advanced_sources", None, None, NOW)["status"], 401)

    def test_missing_entitlement_fails_closed(self):
        result = decide_capability("lifecycles.full", "user-a", None, NOW)
        self.assertFalse(result["allowed"])
        self.assertEqual(result["status"], 503)

    def test_cross_user_entitlement_denied(self):
        result = decide_capability("insights.history", "user-b", PREMIUM, NOW)
        self.assertFalse(result["allowed"])
        self.assertEqual(result["status"], 403)

    def test_active_premium_allowed(self):
        self.assertTrue(decide_capability("explore.advanced_sources", "user-a", PREMIUM, NOW)["allowed"])

    def test_free_plan_denied(self):
        free = {**PREMIUM, "plan": "free"}
        self.assertEqual(decide_capability("connection.comparison", "user-a", free, NOW)["status"], 403)

    def test_expired_plan_denied(self):
        expired = {**PREMIUM, "expires_at": "2026-10-11T00:00:00Z"}
        self.assertEqual(decide_capability("transits.advanced_analysis", "user-a", expired, NOW)["reason"], "expired_subscription")

    def test_grace_requires_future_deadline(self):
        grace = {**PREMIUM, "status": "grace", "expires_at": "2026-10-11T00:00:00Z", "grace_until": "2026-10-13T00:00:00Z"}
        self.assertTrue(decide_capability("lifecycles.full", "user-a", grace, NOW)["allowed"])

    def test_malformed_expiry_fails_closed(self):
        malformed = {**PREMIUM, "expires_at": "not-a-date"}
        self.assertEqual(decide_capability("explore.advanced_sources", "user-a", malformed, NOW)["status"], 503)


if __name__ == "__main__":
    unittest.main()
