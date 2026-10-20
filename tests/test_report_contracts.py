import unittest
from copy import deepcopy

from api.report_contracts import ReportValidationError, assemble_report_payload, validate_report_payload


CHART = {
    "chart_id": "chart-123",
    "chart_fingerprint": "fingerprint-abc",
    "engine_name": "ky-hd-engine",
    "engine_version": "1.2.0",
    "canonical_facts": {"type": "Generator", "authority": "Sacral"},
}
EVIDENCE_IDS = {"hd-source:authority:v3", "hd-source:profile:v2"}


def valid_payload():
    return {
        "schema_version": 1,
        "product_key": "life-purpose-direction",
        "product_version": 1,
        "report_id": "report-123",
        "generated_at": "2026-10-16T10:00:00Z",
        "chart_snapshot": deepcopy(CHART),
        "evidence_manifest": [
            {"evidence_id": "hd-source:authority:v3", "source_id": "hd-source:authority", "source_version": "v3"},
            {"evidence_id": "hd-source:profile:v2", "source_id": "hd-source:profile", "source_version": "v2"},
        ],
        "sections": [
            {
                "section_id": "orientation",
                "title": "Your orientation",
                "blocks": [
                    {
                        "type": "paragraph",
                        "text": "Use this report as a reflective guide.",
                        "evidence_ids": ["hd-source:profile:v2"],
                    },
                    {
                        "type": "bullet_list",
                        "text": ["Notice what feels sustainable.", "Review decisions over time."],
                        "evidence_ids": ["hd-source:authority:v3"],
                    },
                ],
            }
        ],
        "interpretation_kind": ["chart_mechanics", "source_grounded_teaching", "reflective_synthesis"],
        "reflection_prompts": ["Where do you notice this pattern in daily life?"],
        "generation_metadata": {
            "prompt_version": "life-purpose-v1",
            "model_provider": "mock",
            "context_policy_version": "context-v1",
            "generated_at": "2026-10-16T10:00:00Z",
        },
    }


class ReportContractTests(unittest.TestCase):
    def validate(self, payload):
        return validate_report_payload(
            payload,
            expected_chart=CHART,
            supplied_evidence_ids=EVIDENCE_IDS,
        )

    def test_valid_report_is_accepted_and_copy_returned(self):
        payload = valid_payload()
        result = self.validate(payload)
        self.assertEqual(result, payload)
        self.assertIsNot(result, payload)

    def test_assembler_injects_trusted_chart_and_evidence(self):
        payload = valid_payload()
        content = {
            "sections": payload["sections"],
            "interpretation_kind": payload["interpretation_kind"],
            "reflection_prompts": payload["reflection_prompts"],
        }
        supplied = payload["evidence_manifest"]
        result = assemble_report_payload(
            content,
            trusted_chart=CHART,
            supplied_evidence=supplied,
            report_id="server-report-id",
            generated_at="2026-10-16T10:00:00Z",
            generation_metadata={
                "prompt_version": "life-purpose-v1",
                "model_provider": "mock",
                "context_policy_version": "context-v1",
            },
        )
        self.assertEqual(result["chart_snapshot"], CHART)
        self.assertEqual(result["evidence_manifest"], supplied)
        self.assertEqual(result["report_id"], "server-report-id")

    def test_assembler_rejects_model_supplied_chart_metadata(self):
        payload = valid_payload()
        content = {
            "sections": payload["sections"],
            "interpretation_kind": payload["interpretation_kind"],
            "reflection_prompts": payload["reflection_prompts"],
            "chart_snapshot": payload["chart_snapshot"],
        }
        with self.assertRaisesRegex(ReportValidationError, "missing or unexpected fields"):
            assemble_report_payload(
                content,
                trusted_chart=CHART,
                supplied_evidence=payload["evidence_manifest"],
                report_id="server-report-id",
                generated_at="2026-10-16T10:00:00Z",
                generation_metadata={
                    "prompt_version": "life-purpose-v1",
                    "model_provider": "mock",
                    "context_policy_version": "context-v1",
                },
            )

    def test_wrong_chart_fingerprint_is_rejected(self):
        payload = valid_payload()
        payload["chart_snapshot"]["chart_fingerprint"] = "client-invented"
        with self.assertRaisesRegex(ReportValidationError, "chart_fingerprint"):
            self.validate(payload)

    def test_wrong_engine_version_is_rejected(self):
        payload = valid_payload()
        payload["chart_snapshot"]["engine_version"] = "999"
        with self.assertRaisesRegex(ReportValidationError, "engine_version"):
            self.validate(payload)

    def test_canonical_facts_must_match_trusted_chart(self):
        payload = valid_payload()
        payload["chart_snapshot"]["canonical_facts"]["authority"] = "Splenic"
        with self.assertRaisesRegex(ReportValidationError, "canonical_facts do not match"):
            self.validate(payload)

    def test_evidence_not_supplied_to_model_is_rejected(self):
        payload = valid_payload()
        payload["evidence_manifest"].append({
            "evidence_id": "invented-evidence",
            "source_id": "made-up",
            "source_version": "v1",
        })
        with self.assertRaisesRegex(ReportValidationError, "not supplied to synthesis"):
            self.validate(payload)

    def test_block_cannot_reference_missing_manifest_evidence(self):
        payload = valid_payload()
        payload["sections"][0]["blocks"][0]["evidence_ids"] = ["not-in-manifest"]
        with self.assertRaisesRegex(ReportValidationError, "absent from evidence_manifest"):
            self.validate(payload)

    def test_duplicate_section_ids_are_rejected(self):
        payload = valid_payload()
        payload["sections"].append(deepcopy(payload["sections"][0]))
        with self.assertRaisesRegex(ReportValidationError, "section_id values must be unique"):
            self.validate(payload)

    def test_unknown_fields_are_rejected(self):
        payload = valid_payload()
        payload["paid"] = True
        with self.assertRaisesRegex(ReportValidationError, "unexpected fields"):
            self.validate(payload)

    def test_timezone_is_required(self):
        payload = valid_payload()
        payload["generated_at"] = "2026-10-16T10:00:00"
        with self.assertRaisesRegex(ReportValidationError, "include a timezone"):
            self.validate(payload)

    def test_empty_sections_are_rejected(self):
        payload = valid_payload()
        payload["sections"] = []
        with self.assertRaisesRegex(ReportValidationError, "sections must be a non-empty list"):
            self.validate(payload)

    def test_unsupported_interpretation_kind_is_rejected(self):
        payload = valid_payload()
        payload["interpretation_kind"] = ["astrology_prediction"]
        with self.assertRaisesRegex(ReportValidationError, "unsupported value"):
            self.validate(payload)

    def test_non_string_block_type_is_rejected_without_crashing(self):
        payload = valid_payload()
        payload["sections"][0]["blocks"][0]["type"] = ["paragraph"]
        with self.assertRaisesRegex(ReportValidationError, "type is unsupported"):
            self.validate(payload)

    def test_non_string_interpretation_kind_is_rejected_without_crashing(self):
        payload = valid_payload()
        payload["interpretation_kind"] = [["chart_mechanics"]]
        with self.assertRaisesRegex(ReportValidationError, "values must be strings"):
            self.validate(payload)

    def test_boolean_schema_version_is_not_accepted_as_integer_one(self):
        payload = valid_payload()
        payload["schema_version"] = True
        with self.assertRaisesRegex(ReportValidationError, "unsupported schema_version"):
            self.validate(payload)


if __name__ == "__main__":
    unittest.main()
