import sys
import types
import unittest
from datetime import datetime, timezone

sys.path.insert(0, "api")
from uranus_opposition_pipeline import (
    CHAPTERS,
    UranusReportEvidenceError,
    _chart_to_chart,
    _definition,
    generate_uranus_opposition_chapter,
)


class UranusOppositionPipelineTests(unittest.TestCase):
    def test_master_has_exactly_fifteen_ordered_chapters(self):
        self.assertEqual(len(CHAPTERS), 15)
        self.assertEqual(CHAPTERS[0][0], "natal_foundation")
        self.assertEqual(CHAPTERS[-1][0], "closing")

    def test_three_definition_graph_is_derived_from_connections(self):
        result = _definition([
            {"channel": "a", "centres": ["Root", "Sacral"]},
            {"channel": "b", "centres": ["Ajna", "Throat"]},
        ])
        self.assertEqual(result["type"], "split")
        self.assertEqual(len(result["components"]), 2)

    def test_chart_to_chart_connection_classes_are_distinct(self):
        catalog = [
            {"channel": "3-60", "gates": [3, 60], "centres": ["Root", "Sacral"]},
            {"channel": "57-20", "gates": [57, 20], "centres": ["Spleen", "Throat"]},
            {"channel": "37-40", "gates": [37, 40], "centres": ["Solar Plexus", "Heart"]},
            {"channel": "11-56", "gates": [11, 56], "centres": ["Ajna", "Throat"]},
        ]
        result = _chart_to_chart(
            natal_gates={3, 60, 57, 11, 56},
            cycle_gates={60, 20, 37, 40, 11, 56},
            channel_catalog=catalog,
        )
        self.assertEqual([x["channel"] for x in result["compromise_channels"]], ["3-60"])
        self.assertEqual([x["channel"] for x in result["electromagnetic_channels"]], ["57-20"])
        self.assertEqual([x["channel"] for x in result["cycle_only_channels"]], ["37-40"])
        self.assertEqual([x["channel"] for x in result["mutual_complete_channels"]], ["11-56"])

    def test_chapter_generation_is_one_bounded_provider_call(self):
        evidence = {
            "evidence_status": {"locked": True},
            "natal": {"core": {"authority": "sacral"}},
            "cycle": {"core": {"authority": "emotional"}},
            "combined": {},
        }
        calls = []

        def provider(question, foundation, temporal_context=None, knowledge_tier=None):
            calls.append((question, temporal_context, knowledge_tier))
            return {
                "answer": "The first paragraph.\n\nThe second paragraph.",
                "model": "mock",
                "interpretation_status": "ready",
                "factual_basis": ["core"],
                "knowledge_basis": [],
                "relationship_basis": [],
                "limitations": [],
            }

        chapter = generate_uranus_opposition_chapter(
            {"core": {"authority": "sacral"}}, evidence, "cycle_foundation",
            generate_interpretation=provider,
        )
        self.assertEqual(len(calls), 1)
        self.assertEqual(chapter["id"], "cycle_foundation")
        self.assertEqual(len(chapter["blocks"]), 2)
        self.assertIn("natal", calls[0][1]["layer_rules"])
        self.assertEqual(calls[0][1]["evidence_layers"], evidence)

    def test_missing_evidence_lock_fails_closed(self):
        with self.assertRaises(UranusReportEvidenceError):
            generate_uranus_opposition_chapter(
                {}, {"evidence_status": {"locked": False}}, "closing",
                generate_interpretation=lambda *a, **k: {"answer": "Should not run"},
            )

    def test_unknown_chapter_fails_closed(self):
        with self.assertRaises(UranusReportEvidenceError):
            generate_uranus_opposition_chapter(
                {}, {"evidence_status": {"locked": True}}, "unknown",
                generate_interpretation=lambda *a, **k: {"answer": "Should not run"},
            )


if __name__ == "__main__":
    unittest.main()
