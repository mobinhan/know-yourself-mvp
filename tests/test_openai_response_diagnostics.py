import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "api"))

from interpretation_provider import _response_diagnostic, _response_text


class OpenAIResponseDiagnosticsTests(unittest.TestCase):
    def test_diagnostic_identifies_incomplete_reasoning_only_response(self):
        payload = {
            "status": "incomplete",
            "incomplete_details": {"reason": "max_output_tokens"},
            "output": [{"type": "reasoning", "summary": []}],
            "usage": {"output_tokens": 1800},
        }
        diagnostic = _response_diagnostic(payload)
        self.assertIn("status=incomplete", diagnostic)
        self.assertIn("incomplete_reason=max_output_tokens", diagnostic)
        self.assertIn("item_types=reasoning", diagnostic)
        self.assertIn("output_tokens=1800", diagnostic)

    def test_diagnostic_detects_refusal_without_logging_text(self):
        payload = {
            "status": "completed",
            "output": [{
                "type": "message",
                "content": [{"type": "refusal", "refusal": "PRIVATE REFUSAL TEXT"}],
            }],
            "usage": {"output_tokens": 12},
        }
        diagnostic = _response_diagnostic(payload)
        self.assertIn("refusal=true", diagnostic)
        self.assertNotIn("PRIVATE REFUSAL TEXT", diagnostic)

    def test_response_text_extracts_message_output(self):
        payload = {
            "output": [{
                "type": "message",
                "content": [{"type": "output_text", "text": "{\\"answer\\":\\"ok\\"}"}],
            }]
        }
        self.assertEqual(_response_text(payload), '{"answer":"ok"}')

    def test_empty_response_diagnostic_handles_missing_metadata(self):
        self.assertIn("status=unknown", _response_diagnostic({}))
        self.assertIn("item_types=none", _response_diagnostic({}))


if __name__ == "__main__":
    unittest.main()
