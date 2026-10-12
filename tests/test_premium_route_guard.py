import unittest
from unittest.mock import patch

from api.index import handler
from api.interpretation_provider import _select_knowledge


class FakeHandler:
    def __init__(self, path, body):
        self.path = path
        self.headers = {}
        self.body = body
        self.response = None

    def _read_json(self):
        return self.body

    def _send(self, status, payload):
        self.response = (status, payload)
        return self.response

    def _allow_ai_request(self):
        return True


class PremiumRouteGuardTests(unittest.TestCase):
    def test_question_route_denies_before_chart_build_or_model_call(self):
        fake = FakeHandler(
            "/v1/charts/chart-1/questions/context",
            {"birth": {"date": "1982-04-15", "time": "07:38", "timezone": "Europe/Amsterdam"},
             "question": "Give me deep source analysis", "capability": "explore.advanced_sources"},
        )
        with patch("api.index.resolve_request_capability", return_value={
            "allowed": False, "status": 403, "reason": "premium_required"
        }), patch("api.index.build_foundation") as build, patch("api.index.generate_interpretation") as model:
            handler._dispatch(fake, "POST")
        self.assertEqual(fake.response, (403, {"error": "premium_required"}))
        build.assert_not_called()
        model.assert_not_called()

    def test_today_route_denies_before_chart_or_transit_computation(self):
        fake = FakeHandler(
            "/v1/charts/chart-1/today",
            {"birth": {"date": "1982-04-15", "time": "07:38", "timezone": "Europe/Amsterdam"},
             "capability": "transits.advanced_analysis"},
        )
        with patch("api.index.resolve_request_capability", return_value={
            "allowed": False, "status": 403, "reason": "premium_required"
        }), patch("api.index.build_foundation") as build, patch("api.index.build_transit_result") as transit, patch("api.index.generate_interpretation") as model:
            handler._dispatch(fake, "POST")
        self.assertEqual(fake.response, (403, {"error": "premium_required"}))
        build.assert_not_called()
        transit.assert_not_called()
        model.assert_not_called()

    def test_free_knowledge_tier_excludes_external_and_advanced_records(self):
        foundation = {"activations": {"personality": [], "design": []}}
        knowledge, external, relationships = _select_knowledge(
            "channels and authority", foundation, knowledge_tier="basic"
        )
        self.assertEqual(external, [])
        self.assertEqual(relationships, [])
        self.assertTrue(all(
            "L1" in record.get("depth", [])
            and record.get("record_metadata", {}).get("epistemic_class") == "foundational"
            for record in knowledge
        ))


if __name__ == "__main__":
    unittest.main()
