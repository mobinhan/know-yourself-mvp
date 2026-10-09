"""Contract tests for Layer 3 ChatGPT synthesis inputs and guardrails."""
import json
import os
import unittest
from unittest.mock import patch

from api.interpretation_provider import generate_interpretation


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class GateLineSynthesisContractTests(unittest.TestCase):
    def test_chatgpt_receives_specific_evidence_and_framework_guardrails(self):
        source = {
            "id": "EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001",
            "source_id": "EXT_IHDS_OFFICIAL",
            "title": "Gate 57.4 — The Director",
            "claim": (
                "Gate 57.4 combines intuitive clarity with sensitivity to "
                "relationships and a polarity between collaboration and dictatorial behaviour."
            ),
        }
        relationship = {
            "id": "REL-GATE-57-LINE-4-DIRECTOR",
            "status": "validated",
            "external_knowledge_ids": [source["id"]],
            "applies_when": {"gate_number": 57, "line_number": 4},
        }
        foundation = {
            "core": {"gate_set": [57], "channels": [], "centres": []},
            "activations": {
                "personality": [{"body": "Sun", "gate": 57, "line": 4}],
                "design": [],
            },
            "phs": {},
        }
        provider_payload = {
            "output_text": json.dumps({
                "answer": "A source-grounded interpretation of the Director theme.",
                "one_line": "Clarity can guide relationships.",
                "cards": [],
                "factual_basis": ["activations.personality"],
                "knowledge_basis": [source["id"]],
                "relationship_basis": [relationship["id"]],
                "limitations": [],
            })
        }

        def read_json(name):
            if name == "knowledge-records.json":
                return {"records": []}
            if name == "external-knowledge-records.json":
                return {"records": [source]}
            if name == "knowledge-relationships.json":
                return {"edges": [relationship]}
            raise AssertionError(f"Unexpected knowledge file: {name}")

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}), patch(
            "api.interpretation_provider._read_json", side_effect=read_json
        ), patch(
            "api.interpretation_provider.urlopen",
            return_value=FakeResponse(provider_payload),
        ) as mocked_urlopen:
            result = generate_interpretation("Explain Gate 57.4", foundation)

        request = mocked_urlopen.call_args.args[0]
        body = json.loads(request.data.decode("utf-8"))
        model_input = json.loads(body["input"])
        instructions = body["instructions"]

        self.assertIn(source["id"], {item["id"] for item in model_input["external_knowledge"]})
        self.assertIn(
            relationship["id"],
            {item["id"] for item in model_input["validated_relationships"]},
        )
        self.assertIn("There is no separate critic", instructions)
        self.assertIn("Never derive a gate-line synthesis by adding generic line keywords", instructions)
        self.assertIn("Do not calculate or infer chart mechanics", instructions)
        self.assertEqual(result["interpretation_status"], "ready")
        self.assertIn(source["id"], result["knowledge_basis"])
        self.assertIn(relationship["id"], result["relationship_basis"])

    def test_unknown_evidence_ids_are_removed_from_chatgpt_output(self):
        foundation = {
            "core": {"gate_set": [57], "channels": [], "centres": []},
            "activations": {"personality": [{"gate": 57, "line": 4}], "design": []},
            "phs": {},
        }
        provider_payload = {
            "output_text": json.dumps({
                "answer": "A test interpretation.",
                "knowledge_basis": ["MADE-UP-SOURCE-ID"],
                "relationship_basis": ["MADE-UP-RELATIONSHIP-ID"],
                "factual_basis": ["invented_field"],
                "cards": [],
                "limitations": [],
            })
        }

        def read_json(name):
            if name == "knowledge-records.json":
                return {"records": []}
            if name == "external-knowledge-records.json":
                return {"records": []}
            if name == "knowledge-relationships.json":
                return {"edges": []}
            raise AssertionError(f"Unexpected knowledge file: {name}")

        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}), patch(
            "api.interpretation_provider._read_json", side_effect=read_json
        ), patch(
            "api.interpretation_provider.urlopen",
            return_value=FakeResponse(provider_payload),
        ):
            result = generate_interpretation("Explain Gate 57.4", foundation)

        self.assertEqual(result["knowledge_basis"], [])
        self.assertEqual(result["relationship_basis"], [])
        self.assertEqual(result["factual_basis"], [])


if __name__ == "__main__":
    unittest.main()
