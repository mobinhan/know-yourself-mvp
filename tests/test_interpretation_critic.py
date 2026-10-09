"""Regression tests for deterministic post-synthesis quality checks."""
import unittest

from api.interpretation_critic import review_interpretation


class InterpretationCriticTests(unittest.TestCase):
    def setUp(self):
        self.foundation = {
            "core": {
                "gate_set": [57, 34],
                "channels": [{"channel": "34-57"}],
                "centres": ["spleen", "sacral"],
            },
            "activations": {
                "personality": [{"gate": 57, "line": 4}],
                "design": [{"gate": 34, "line": 2}],
            },
        }

    def review(self, answer, temporal_context=None, external=None, relationships=None):
        return review_interpretation(
            answer, self.foundation, temporal_context, external or [], relationships or []
        )

    def test_detects_invented_natal_gate_activation(self):
        result = self.review("Gate 7 is activated in your chart.")
        self.assertFalse(result["passed"])
        self.assertIn("canonical_gate_status_conflict:gate_7", result["issues"])

    def test_detects_false_negative_for_real_natal_gate(self):
        result = self.review("Your Gate 57 is not activated.")
        self.assertFalse(result["passed"])
        self.assertIn("canonical_gate_status_conflict:gate_57", result["issues"])

    def test_detects_invented_defined_channel(self):
        result = self.review("Your channel 7-31 is defined.")
        self.assertFalse(result["passed"])
        self.assertIn("canonical_channel_status_conflict:7-31", result["issues"])

    def test_accepts_canonical_channel_claim(self):
        result = self.review("Your channel 34-57 is defined.")
        self.assertTrue(result["passed"], result["issues"])

    def test_blocks_gate_line_archetype_without_exact_source(self):
        result = self.review("Gate 34.2 is the Director archetype.")
        self.assertFalse(result["passed"])
        self.assertIn("unsupported_gate_line_synthesis:gate_34_line_2", result["issues"])

    def test_blocks_transit_claim_without_temporal_evidence(self):
        result = self.review("Today's transit activates Gate 20.")
        self.assertFalse(result["passed"])
        self.assertIn("transit_claim_without_temporal_evidence", result["issues"])

    def test_allows_transit_claim_when_temporal_context_is_supplied(self):
        result = self.review(
            "Today's transit activates Gate 20.", temporal_context={"date": "2026-10-09"}
        )
        self.assertTrue(result["passed"], result["issues"])


if __name__ == "__main__":
    unittest.main()
