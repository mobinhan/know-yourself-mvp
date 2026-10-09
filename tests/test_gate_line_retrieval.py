"""Focused regression tests for source-specific gate-line retrieval."""
import unittest
from unittest.mock import patch

from api.interpretation_provider import _select_knowledge


GATE_574 = {
    "id": "EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001",
    "source_id": "EXT_IHDS_OFFICIAL",
    "title": "Gate 57.4 — The Director",
    "claim": "Gate 57.4 combines intuitive clarity with the Director relationship theme.",
    "summary": "Gate-line synthesis for relationships and intuitive clarity.",
}


def foundation(active=True):
    activations = [{"gate": 57, "line": 4}] if active else [{"gate": 20, "line": 1}]
    return {
        "activations": {"personality": activations, "design": []},
        "core": {},
    }


class GateLineRetrievalTests(unittest.TestCase):
    def test_exact_active_gate_line_survives_external_record_limit(self):
        generic_records = [
            {
                "id": f"EXT-GENERIC-{i}",
                "source_id": "EXT_GENERIC",
                "title": "Gate 57 relationship intuitive clarity context",
                "claim": "General contextual material about relationships and clarity.",
                "summary": "General gate context.",
            }
            for i in range(10)
        ]
        with patch(
            "api.interpretation_provider._read_json",
            side_effect=[
                {"records": []},
                {"records": generic_records + [GATE_574]},
                {"edges": [{
                    "id": "REL-GATE-57-LINE-4-DIRECTOR",
                    "status": "validated",
                    "external_knowledge_ids": [GATE_574["id"]],
                }]},
            ],
        ):
            _, external, relationships = _select_knowledge(
                "Explain Gate 57.4", foundation(active=True)
            )
        self.assertIn(GATE_574["id"], {record["id"] for record in external})
        self.assertIn(
            "REL-GATE-57-LINE-4-DIRECTOR",
            {edge["id"] for edge in relationships},
        )

    def test_specific_gate_line_source_requires_chart_activation(self):
        with patch(
            "api.interpretation_provider._read_json",
            side_effect=[
                {"records": []},
                {"records": [GATE_574]},
                {"edges": [{
                    "id": "REL-GATE-57-LINE-4-DIRECTOR",
                    "status": "validated",
                    "external_knowledge_ids": [GATE_574["id"]],
                }]},
            ],
        ):
            _, external, relationships = _select_knowledge(
                "Explain Gate 57.4", foundation(active=False)
            )
        self.assertNotIn(GATE_574["id"], {record["id"] for record in external})
        self.assertNotIn(
            "REL-GATE-57-LINE-4-DIRECTOR",
            {edge["id"] for edge in relationships},
        )


    def test_relationship_is_not_attached_when_source_evidence_is_missing(self):
        relationship = {
            "id": "REL-GATE-57-LINE-4-DIRECTOR",
            "status": "validated",
            "external_knowledge_ids": [GATE_574["id"]],
        }
        with patch(
            "api.interpretation_provider._read_json",
            side_effect=[
                {"records": []},
                {"records": []},
                {"edges": [relationship]},
            ],
        ):
            _, external, relationships = _select_knowledge(
                "Explain Gate 57.4", foundation(active=True)
            )
        self.assertEqual(external, [])
        self.assertNotIn(
            "REL-GATE-57-LINE-4-DIRECTOR",
            {edge["id"] for edge in relationships},
        )



    def test_director_keyword_alone_does_not_count_as_exact_gate_line(self):
        director_only = {
            "id": "EXT-GENERIC-DIRECTOR",
            "source_id": "EXT_GENERIC",
            "title": "Gate 57 Director relationship theme",
            "claim": "General intuitive clarity and relationships.",
            "summary": "Gate context for relationships.",
        }
        generic_records = [
            {
                "id": f"EXT-GENERIC-{i}",
                "source_id": "EXT_GENERIC",
                "title": "Gate 57 relationship intuitive clarity context",
                "claim": "General contextual material about relationships and clarity.",
                "summary": "General gate context.",
            }
            for i in range(8)
        ]
        with patch(
            "api.interpretation_provider._read_json",
            side_effect=[
                {"records": []},
                {"records": [director_only] + generic_records + [GATE_574]},
                {"edges": []},
            ],
        ):
            _, external, _ = _select_knowledge(
                "Explain Gate 57.4", foundation(active=True)
            )
        selected_ids = {record["id"] for record in external}
        self.assertIn(GATE_574["id"], selected_ids)
        self.assertNotIn("EXT-GENERIC-DIRECTOR", selected_ids)



if __name__ == "__main__":
    unittest.main()
