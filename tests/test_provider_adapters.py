"""Contract tests for configurable server-side AI provider adapters."""
import json
import os
import unittest
from unittest.mock import patch

from api.interpretation_provider import (
    InterpretationProviderError,
    _call_model,
    _provider_text,
)


class FakeResponse:
    def __init__(self, payload):
        self.payload = json.dumps(payload).encode()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def read(self):
        return self.payload


class ProviderAdapterTests(unittest.TestCase):
    def test_openai_uses_responses_api_and_store_false(self):
        response_payload = {"output_text": '{"answer":"Grounded answer"}', "usage": {"input_tokens": 42}}
        with patch.dict(os.environ, {"OPENAI_API_KEY": "test-key"}, clear=False), patch(
            "api.interpretation_provider.urlopen", return_value=FakeResponse(response_payload)
        ) as mocked:
            payload, usage = _call_model("openai", "test-model", "instructions", {"question": "test"})
        request = mocked.call_args.args[0]
        body = json.loads(request.data)
        self.assertEqual(request.full_url, "https://api.openai.com/v1/responses")
        self.assertFalse(body["store"])
        self.assertEqual(body["text"]["format"]["type"], "json_object")
        self.assertEqual(usage["input_tokens"], 42)
        self.assertEqual(_provider_text("openai", payload), '{"answer":"Grounded answer"}')

    def test_gemini_uses_server_key_header_and_json_mode(self):
        response_payload = {
            "candidates": [{"content": {"parts": [{"text": '{"answer":"Gemini answer"}'}]}}],
            "usageMetadata": {"promptTokenCount": 25, "candidatesTokenCount": 8},
        }
        with patch.dict(os.environ, {"GEMINI_API_KEY": "test-key"}, clear=False), patch(
            "api.interpretation_provider.urlopen", return_value=FakeResponse(response_payload)
        ) as mocked:
            payload, usage = _call_model("gemini", "test-gemini-model", "instructions", {"question": "test"})
        request = mocked.call_args.args[0]
        body = json.loads(request.data)
        self.assertIn(":generateContent", request.full_url)
        self.assertEqual(request.get_header("X-goog-api-key"), "test-key")
        self.assertEqual(body["generationConfig"]["responseMimeType"], "application/json")
        self.assertEqual(usage["promptTokenCount"], 25)
        self.assertEqual(json.loads(_provider_text("gemini", payload))["answer"], "Gemini answer")

    def test_mistral_uses_json_object_mode(self):
        response_payload = {
            "choices": [{"message": {"content": '{"answer":"Mistral answer"}'}}],
            "usage": {"prompt_tokens": 33, "completion_tokens": 10},
        }
        with patch.dict(os.environ, {"MISTRAL_API_KEY": "test-key"}, clear=False), patch(
            "api.interpretation_provider.urlopen", return_value=FakeResponse(response_payload)
        ) as mocked:
            payload, usage = _call_model("mistral", "test-mistral-model", "instructions", {"question": "test"})
        request = mocked.call_args.args[0]
        body = json.loads(request.data)
        self.assertEqual(request.full_url, "https://api.mistral.ai/v1/chat/completions")
        self.assertEqual(body["response_format"]["type"], "json_object")
        self.assertEqual(usage["prompt_tokens"], 33)
        self.assertEqual(json.loads(_provider_text("mistral", payload))["answer"], "Mistral answer")

    def test_alternate_provider_without_key_fails_closed(self):
        for provider, key in (("gemini", "GEMINI_API_KEY"), ("mistral", "MISTRAL_API_KEY")):
            with self.subTest(provider=provider), patch.dict(os.environ, {}, clear=True):
                with self.assertRaises(InterpretationProviderError) as caught:
                    _call_model(provider, "test-model", "instructions", {})
                self.assertEqual(str(caught.exception), "missing_key")

    def test_unknown_provider_fails_closed(self):
        with self.assertRaises(InterpretationProviderError) as caught:
            _call_model("unknown", "model", "instructions", {})
        self.assertEqual(str(caught.exception), "unsupported_provider")


if __name__ == "__main__":
    unittest.main()
