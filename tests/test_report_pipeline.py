import unittest

from api.report_contracts import ReportValidationError
from api.report_pipeline import assemble_life_purpose_report


CHART = {
    "chart_id": "chart-123",
    "chart_fingerprint": "fingerprint-abc",
    "engine_name": "ky-hd-engine",
    "engine_version": "1.2.0",
    "canonical_facts": {"type": "Generator", "authority": "Sacral", "channels": ["34-57"]},
}
MANIFEST = [
    {"evidence_id": "hd:type:v1", "source_id": "hd:type", "source_version": "v1"},
    {"evidence_id": "hd:authority:v2", "source_id": "hd:authority", "source_version": "v2"},
]
IDS = {"hd:type:v1", "hd:authority:v2"}


def section(section_id, title, basis=None, warnings=None):
    return {
        "section_id": section_id,
        "section_title": title,
        "validation_warnings": warnings or [],
        "content": {
            "answer": f"Verified narrative for {title}.",
            "factual_basis": ["core"],
            "knowledge_basis": basis or ["hd:type:v1"],
            "relationship_basis": [],
            "cards": [{
                "title": "Observe the pattern",
                "summary": "A source-grounded possibility.",
                "reflection": "Where do you notice this?",
            }],
        },
    }


def required_sections():
    ids = [
        ("orientation", "Orientation"),
        ("foundations", "Foundations"),
        ("life_theme", "Your Life Theme"),
        ("integrated_themes", "Integrated Themes"),
        ("decision_direction", "Decision and Direction"),
        ("conditioning", "Conditioning"),
        ("integration", "Integration"),
    ]
    return [section(sid, title) for sid, title in ids]


class ReportPipelineTests(unittest.TestCase):
    def assemble(self, sections, **overrides):
        args = {
            "trusted_chart": CHART,
            "evidence_manifest": MANIFEST,
            "report_id": "report-123",
            "generated_at": "2026-10-20T03:00:00Z",
            "prompt_version": "life-purpose-v1",
            "model_provider": "mock",
            "context_policy_version": "context-v1",
            "supplied_evidence_ids": IDS,
        }
        args.update(overrides)
        return assemble_life_purpose_report(sections, **args)

    def test_builds_valid_ordered_envelope_and_maps_cards(self):
        sections = required_sections()
        sections.insert(6, section("life_cycles", "Life Cycles"))
        payload = self.assemble(sections)
        self.assertEqual(payload["product_key"], "life-purpose-direction")
        self.assertEqual(
            [s["section_id"] for s in payload["sections"]],
            ["orientation", "foundations", "life_theme", "integrated_themes",
             "decision_direction", "conditioning", "life_cycles", "integration"],
        )
        self.assertEqual(payload["sections"][0]["blocks"][0]["type"], "paragraph")
        self.assertEqual(payload["sections"][0]["blocks"][1]["type"], "callout")
        self.assertEqual(payload["chart_snapshot"], CHART)

    def test_conditional_life_cycles_may_be_omitted(self):
        payload = self.assemble(required_sections())
        self.assertNotIn("life_cycles", [s["section_id"] for s in payload["sections"]])

    def test_unresolved_warnings_fail_closed(self):
        sections = required_sections()
        sections[2]["validation_warnings"] = ["incorrect channel 11-56"]
        with self.assertRaisesRegex(ReportValidationError, "unresolved validation_warnings"):
            self.assemble(sections)

    def test_unknown_evidence_reference_fails_closed(self):
        sections = required_sections()
        sections[0]["content"]["knowledge_basis"] = ["not-in-bundle"]
        with self.assertRaisesRegex(ReportValidationError, "not supplied to synthesis"):
            self.assemble(sections)

    def test_missing_required_section_is_rejected(self):
        with self.assertRaisesRegex(ReportValidationError, "missing required sections"):
            self.assemble(required_sections()[:-1])

    def test_duplicate_section_is_rejected(self):
        sections = required_sections()
        sections.append(dict(sections[0]))
        with self.assertRaisesRegex(ReportValidationError, "duplicate section_id"):
            self.assemble(sections)


if __name__ == "__main__":
    unittest.main()
