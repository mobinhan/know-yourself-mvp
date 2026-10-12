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

    def test_client_cannot_downgrade_open_question_to_basic(self):
        fake = FakeHandler(
            "/v1/charts/chart-1/questions/context",
            {"birth": {"date": "1982-04-15", "time": "07:38", "timezone": "Europe/Amsterdam"},
             "question": "What is my Uranus opposition saying about me?",
             "capability": "guide.basic", "tier": "free", "plan": "free"},
        )
        with patch("api.index.resolve_request_capability", return_value={
            "allowed": False, "status": 403, "reason": "premium_required"
        }) as resolve, patch("api.index.build_foundation") as build, patch("api.index.generate_interpretation") as model:
            handler._dispatch(fake, "POST")
        self.assertEqual(fake.response, (403, {"error": "premium_required"}))
        resolve.assert_called_once()
        self.assertEqual(resolve.call_args.args[1], "guide.open_question")
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

    def test_basic_route_rejects_open_ended_life_cycle_before_credit_or_model(self):
        fake = FakeHandler(
            "/v1/charts/chart-1/questions/basic",
            {"birth": {"date": "1982-04-15", "time": "07:38", "timezone": "Europe/Amsterdam"},
             "question": "Tell me about my Chiron Return", "plan": "free", "tier": "basic"},
        )
        with patch("api.index.reserve_chat_credit") as reserve, patch("api.index.build_foundation") as build, patch("api.index.generate_interpretation") as model:
            handler._dispatch(fake, "POST")
        self.assertEqual(fake.response[0], 403)
        self.assertEqual(fake.response[1]["error"], "premium_required")
        reserve.assert_not_called()
        build.assert_not_called()
        model.assert_not_called()

    def test_basic_route_reserves_credit_before_model_and_finalizes_success(self):
        fake = FakeHandler(
            "/v1/charts/chart-1/questions/basic",
            {"birth": {"date": "1982-04-15", "time": "07:38", "timezone": "Europe/Amsterdam"},
             "question": "What is my Personality Sun gate and line?"},
        )
        fake.headers = {"Authorization": "Bearer test-token", "Idempotency-Key": "11111111-1111-4111-8111-111111111111"}
        foundation = {"core": {}, "activations": {"personality": [], "design": []}, "phs": {}}
        with patch("api.index.reserve_chat_credit", return_value={
            "allowed": True, "reason": "credit_reserved", "credits_used": 1, "daily_limit": 3,
            "reset_at": "2026-10-13T00:00:00Z", "replayed": False
        }) as reserve, patch("api.index.build_foundation", return_value=foundation), patch(
            "api.index.generate_interpretation", return_value={
                "interpretation_status": "ready", "answer": "Your Personality Sun is Gate 42.5."
            }
        ) as model, patch("api.index.finalize_chat_credit", return_value={"updated": True, "outcome": "consumed"}) as finalize:
            handler._dispatch(fake, "POST")
        self.assertEqual(fake.response[0], 200)
        self.assertEqual(fake.response[1]["credit_usage"]["daily_limit"], 3)
        reserve.assert_called_once()
        self.assertEqual(reserve.call_args.args[2], "guide.basic_question")
        model.assert_called_once()
        self.assertEqual(model.call_args.kwargs["knowledge_tier"], "basic")
        finalize.assert_called_once_with(fake.headers, "11111111-1111-4111-8111-111111111111", "consumed")

    def test_basic_route_ignores_client_premium_claim_for_advanced_question(self):
        fake = FakeHandler(
            "/v1/charts/chart-1/questions/basic",
            {"birth": {"date": "1982-04-15", "time": "07:38", "timezone": "Europe/Amsterdam"},
             "question": "Go deeper and connect my Incarnation Cross to my life cycles",
             "plan": "premium", "capability": "guide.basic_question"},
        )
        with patch("api.index.reserve_chat_credit") as reserve, patch("api.index.build_foundation") as build, patch("api.index.generate_interpretation") as model:
            handler._dispatch(fake, "POST")
        self.assertEqual(fake.response[0], 403)
        self.assertEqual(fake.response[1]["error"], "premium_required")
        reserve.assert_not_called()
        build.assert_not_called()
        model.assert_not_called()

    def test_basic_classifier_accepts_narrow_chart_lookup(self):
        from api.index import classify_basic_question
        self.assertTrue(classify_basic_question("What is my Personality Sun gate and line?"))
        self.assertTrue(classify_basic_question("Show my defined channels"))

    def test_basic_classifier_rejects_open_ended_or_sensitive_depth_questions(self):
        from api.index import classify_basic_question
        rejected = [
            "Tell me about my Chiron Return",
            "What does my Incarnation Cross mean for me personally?",
            "Go deeper and connect this to my overall design",
            "Interpret my PHS determination",
            "Compare my chart with my partner",
            "What is my future transit saying about me?",
        ]
        for question in rejected:
            with self.subTest(question=question):
                self.assertFalse(classify_basic_question(question))

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
