"""Isolated tests for the legacy critic utility; not tests of the active 3framework path."""
import unittest

from api.interpretation_critic import review_interpretation


class InterpretationCriticTests(unittest.TestCase):
    def setUp(self):
        self.foundation = {
            "core": {
                "gate_set": [57, 34],
                "channels": [{"channel": "34-57"}],
                "centres": ["spleen", "sacral"],
                "profile": "2/4",
                "type": "projector",
                "authority": "splenic",
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

    def test_detects_centre_definition_conflicts(self):
        cases = [
            ("Your spleen centre is not defined.", "canonical_centre_status_conflict:spleen"),
            ("Your head centre is defined.", "canonical_centre_status_conflict:head"),
        ]
        for answer, expected_issue in cases:
            with self.subTest(answer=answer):
                result = self.review(answer)
                self.assertFalse(result["passed"])
                self.assertIn(expected_issue, result["issues"])

    def test_blocks_gate_line_archetype_without_exact_source(self):
        result = self.review("Gate 34.2 is the Director archetype.")
        self.assertFalse(result["passed"])
        self.assertIn("unsupported_gate_line_synthesis:gate_34_line_2", result["issues"])

    def test_blocks_transit_claim_without_temporal_evidence(self):
        result = self.review("Today's transit activates Gate 20.")
        self.assertFalse(result["passed"])
        self.assertIn("transit_claim_without_temporal_evidence", result["issues"])

    def test_transit_claim_needs_actual_transit_gate_evidence(self):
        result = self.review(
            "Today's transit activates Gate 34.",
            temporal_context={"transit_gates": [34, 57]},
        )
        self.assertTrue(result["passed"], result["issues"])

    def test_gate_line_status_is_checked_against_exact_activation(self):
        self.assertTrue(self.review("Your Gate 57.4 is active.")["passed"])
        result = self.review("Your Gate 57.3 is active.")
        self.assertFalse(result["passed"])
        self.assertIn("canonical_gate_line_status_conflict:gate_57_line_3", result["issues"])

    def test_accepts_exact_gate_line_source_and_validated_relationship(self):
        source = {
            "id": "EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001",
            "title": "Gate 57.4 — The Director",
            "claim": "Gate 57.4 is known as the Director archetype.",
            "applies_when": {"gate_number": 57, "line_number": 4},
        }
        relationship = {
            "id": "REL-GATE-57-LINE-4-DIRECTOR",
            "status": "validated",
            "external_knowledge_ids": [source["id"]],
            "applies_when": {"gate_number": 57, "line_number": 4},
        }
        result = self.review(
            "Gate 57.4 is known as the Director archetype.",
            external=[source], relationships=[relationship],
        )
        self.assertTrue(result["passed"], result["issues"])

    def test_rejects_source_and_relationship_for_different_gate_line(self):
        source = {
            "id": "EXT-KNOW-IHDS-GATE-34-2-OTHER-001",
            "title": "Gate 34.2 — Other Theme",
            "claim": "Gate 34.2 is known as another archetype.",
            "applies_when": {"gate_number": 34, "line_number": 2},
        }
        relationship = {
            "id": "REL-GATE-34-LINE-2-OTHER",
            "status": "validated",
            "external_knowledge_ids": [source["id"]],
            "applies_when": {"gate_number": 34, "line_number": 2},
        }
        result = self.review(
            "Gate 57.4 is known as the Director archetype.",
            external=[source], relationships=[relationship],
        )
        self.assertFalse(result["passed"])
        self.assertIn("unsupported_gate_line_synthesis:gate_57_line_4", result["issues"])

    def test_accepts_defined_centre_claim(self):
        result = self.review("Your spleen centre is defined.")
        self.assertTrue(result["passed"], result["issues"])

    def test_detects_profile_type_and_authority_conflicts(self):
        cases = [
            ("Your profile is 5/1.", "canonical_profile_conflict:5/1"),
            ("Your type is Generator.", "canonical_type_conflict:generator"),
            ("Your authority is Emotional.", "canonical_authority_conflict:emotional"),
        ]
        for answer, expected_issue in cases:
            with self.subTest(answer=answer):
                result = self.review(answer)
                self.assertFalse(result["passed"])
                self.assertIn(expected_issue, result["issues"])

    def test_accepts_canonical_profile_type_and_authority(self):
        for answer in (
            "Your profile is 2/4.",
            "Your type is Projector.",
            "Your authority is Splenic.",
        ):
            with self.subTest(answer=answer):
                result = self.review(answer)
                self.assertTrue(result["passed"], result["issues"])

    def test_transit_claim_must_match_transit_gate_set(self):
        result = self.review(
            "Today's transit activates Gate 20.",
            temporal_context={"transit_gates": [34, 57]},
        )
        self.assertFalse(result["passed"])
        self.assertIn("transit_gate_not_present:gate_20", result["issues"])
        accepted = self.review(
            "Today's transit activates Gate 34.",
            temporal_context={"transit_gates": [34, 57]},
        )
        self.assertTrue(accepted["passed"], accepted["issues"])

    def test_temporal_context_without_transit_gates_is_not_sufficient(self):
        result = self.review(
            "Today's transit activates Gate 20.", temporal_context={"date": "2026-10-09"}
        )
        self.assertFalse(result["passed"])
        self.assertIn("transit_claim_without_temporal_evidence", result["issues"])



if __name__ == "__main__":
    unittest.main()
