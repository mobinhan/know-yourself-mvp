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


    def test_evidence_builder_uses_exact_reference_pass_and_three_layers(self):
        from datetime import datetime, timezone
        from unittest.mock import patch
        import types
        from uranus_opposition_pipeline import build_uranus_opposition_evidence

        events = [
            {"type": "uranus_opposition", "body": "uranus",
             "timestamp": "2026-07-08T12:20:45Z", "target_degrees": 180.0,
             "direction": "forward"},
            {"type": "uranus_opposition", "body": "uranus",
             "timestamp": "2026-11-16T11:19:00Z", "target_degrees": 180.0,
             "direction": "retrograde"},
            {"type": "uranus_opposition", "body": "uranus",
             "timestamp": "2027-04-27T13:31:00Z", "target_degrees": 180.0,
             "direction": "forward"},
        ]
        fake_temporal = types.SimpleNamespace(
            find_longitude_event=lambda *a, **k: events
        )
        foundation = {
            "birth_data": {
                "date": "1982-04-15", "time": "07:38",
                "timezone": "Europe/Amsterdam", "location": "Baarn",
            },
            "core": {
                "type": "generator", "strategy": "wait_to_respond",
                "authority": "sacral", "profile": "5/1",
                "definition": {"type": "split", "components": [["Root"], ["Sacral"]]},
                "incarnation_cross": {}, "channels": [], "centres": ["Root", "Sacral"],
            },
            "activations": {
                "personality": [
                    {"body": "uranus", "longitude": 243.0, "gate": 3},
                    {"body": "sun", "longitude": 24.0, "gate": 42},
                    {"body": "earth", "longitude": 204.0, "gate": 32},
                    {"body": "south_node", "longitude": 10.0, "gate": 54},
                    {"body": "north_node", "longitude": 190.0, "gate": 53},
                ],
                "design": [
                    {"body": "sun", "longitude": 204.0, "gate": 60},
                    {"body": "earth", "longitude": 24.0, "gate": 56},
                    {"body": "south_node", "longitude": 15.0, "gate": 61},
                    {"body": "north_node", "longitude": 195.0, "gate": 62},
                ],
            },
        }
        cycle_acts = {
            "personality": [
                {"body": "sun", "gate": 53, "line": 2, "longitude": 64.0},
                {"body": "earth", "gate": 54, "line": 2, "longitude": 244.0},
                {"body": "south_node", "gate": 59, "line": 1, "longitude": 120.0},
                {"body": "north_node", "gate": 55, "line": 1, "longitude": 300.0},
                {"body": "uranus", "gate": 20, "line": 1, "longitude": 64.0},
            ],
            "design": [
                {"body": "sun", "gate": 51, "line": 4, "timestamp_utc": "2026-04-08T04:47:06Z"},
                {"body": "earth", "gate": 57, "line": 4},
                {"body": "south_node", "gate": 40, "line": 3},
                {"body": "north_node", "gate": 37, "line": 3},
            ],
        }
        seen = {}

        def calc(local_iso, tz):
            seen["local_iso"] = local_iso
            seen["tz"] = tz
            return {"activations": cycle_acts, "ephemeris": {"provider": "Swiss Ephemeris"}}

        def derive(activations):
            return {
                "type": "generator", "strategy": "wait_to_respond",
                "authority": "emotional", "profile": "2/4",
                "incarnation_cross": {"personality_sun": {"gate": 53, "line": 2}},
            }

        with patch.dict(sys.modules, {"temporal_ephemeris": fake_temporal}):
            result = build_uranus_opposition_evidence(
                foundation, calculate_chart=calc,
                derive_structure=derive, channel_catalog=[],
            )
        self.assertEqual(len(result["all_exact_passes"]), 3)
        self.assertEqual(result["cycle"]["reference_pass"]["timestamp"], "2026-07-08T12:20:45Z")
        self.assertEqual(result["cycle"]["design_timestamp_utc"], "2026-04-08T04:47:06Z")
        self.assertEqual(result["cycle"]["core"]["authority"], "emotional")
        self.assertEqual(result["natal"]["core"]["authority"], "sacral")
        self.assertTrue(result["evidence_status"]["locked"])
        self.assertEqual(seen["tz"], "Europe/Amsterdam")

    def test_invalid_reference_pass_index_fails_closed(self):
        from unittest.mock import patch
        import types
        from uranus_opposition_pipeline import build_uranus_opposition_evidence

        fake_temporal = types.SimpleNamespace(find_longitude_event=lambda *a, **k: [])
        with patch.dict(sys.modules, {"temporal_ephemeris": fake_temporal}):
            with self.assertRaises(UranusReportEvidenceError):
                build_uranus_opposition_evidence(
                    {"birth_data": {"date": "1982-04-15", "time": "07:38",
                                    "timezone": "Europe/Amsterdam"},
                     "activations": {"personality": [{"body": "uranus", "longitude": 243.0}]}},
                    calculate_chart=lambda *a: {}, derive_structure=lambda *a: {},
                    channel_catalog=[],
                )


    def test_golden_1982_reference_matches_natal_and_cycle_mechanics(self):
        # Integration regression against the actual deterministic engine and
        # the uploaded 15 April 1982 master report.
        from api.index import build_foundation, calculate_chart, derive_structure, CHANNELS
        from uranus_opposition_pipeline import build_uranus_opposition_evidence

        foundation = build_foundation({
            "date": "1982-04-15",
            "time": "07:38",
            "timezone": "Europe/Amsterdam",
            "location": "Baarn, Netherlands",
        }, chart_id="golden-uranus-1982")
        natal_channels = sorted(x["channel"] for x in foundation["core"]["channels"])
        self.assertEqual(
            natal_channels,
            ["11-56", "28-38", "3-60", "32-54", "34-57", "42-53"],
        )
        self.assertEqual(foundation["core"]["type"], "generator")
        self.assertEqual(foundation["core"]["authority"], "sacral")
        self.assertEqual(foundation["core"]["profile"], "5/1")

        evidence = build_uranus_opposition_evidence(
            foundation,
            calculate_chart=calculate_chart,
            derive_structure=derive_structure,
            channel_catalog=CHANNELS,
            reference_pass_index=0,
        )
        passes = evidence["all_exact_passes"]
        self.assertEqual(
            [item["timestamp"][:10] for item in passes[:3]],
            ["2026-07-08", "2026-11-16", "2027-04-27"],
        )
        cycle = evidence["cycle"]
        self.assertEqual(cycle["core"]["authority"], "emotional")
        self.assertEqual(cycle["core"]["profile"], "2/4")
        self.assertEqual(cycle["core"]["definition"]["type"], "triple_split")
        self.assertEqual(
            cycle["core"]["incarnation_cross"]["personality_sun"],
            {"gate": 53, "line": 2},
        )
        self.assertEqual(
            cycle["core"]["incarnation_cross"]["personality_earth"],
            {"gate": 54, "line": 2},
        )
        self.assertEqual(
            cycle["core"]["incarnation_cross"]["design_sun"],
            {"gate": 51, "line": 4},
        )
        self.assertEqual(
            cycle["core"]["incarnation_cross"]["design_earth"],
            {"gate": 57, "line": 4},
        )
        self.assertTrue(evidence["evidence_status"]["locked"])


    def test_pdf_renderer_produces_cover_orientation_and_fifteen_chapters(self):
        import tempfile
        from pathlib import Path
        from uranus_opposition_pdf import render_uranus_opposition_pdf

        data = {
            "title": "The Uranus Opposition",
            "subtitle": "A personal Human Design life-cycle reading",
            "client_name": "Golden Chart #2",
            "birth": {"date_time": "15 April 1982 · 07:38", "place": "Baarn, Netherlands"},
            "cycle_period": "July 2026 – April 2027",
            "evidence_status": {"locked": True},
            "validation_warnings": [],
            "introduction": {
                "heading": "A turning point within a longer journey",
                "paragraphs": ["The natal foundation remains the reference."],
                "pull_quote": "A turning point does not erase the road behind you.",
                "how_to_read_heading": "How to read this report",
                "how_to_read": "Read the natal, cycle and combined layers separately.",
                "layers": {
                    "natal": {"headline": "Generator · Sacral", "subline": "5/1 · Split"},
                    "cycle": {"headline": "Generator · Emotional", "subline": "2/4 · Triple Split"},
                    "combined": {"headline": "Temporary field", "subline": "Context, not redesign"},
                },
            },
            "chapters": [
                {"id": chapter_id, "title": title,
                 "blocks": [{"type": "paragraph", "text": f"Substantive chapter {index}. " * 20}]}
                for index, (chapter_id, title, _focus) in enumerate(CHAPTERS, 1)
            ],
        }
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / "golden-test.pdf"
            render_uranus_opposition_pdf(data, target)
            payload = target.read_bytes()
            self.assertGreater(len(payload), 5000)
            self.assertEqual(payload.count(b"/Type /Page"), 17)

    def test_pdf_renderer_rejects_unlocked_or_incomplete_report(self):
        from uranus_opposition_pdf import validate_report
        with self.assertRaises(ValueError):
            validate_report({"evidence_status": {"locked": False}, "chapters": []})
        with self.assertRaises(ValueError):
            validate_report({"evidence_status": {"locked": True}, "chapters": []})


if __name__ == "__main__":
    unittest.main()
