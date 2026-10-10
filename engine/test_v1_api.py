import importlib.util
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("ky_v1_api", ROOT / "api" / "index.py")
API = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(API)

def test_golden_chart_structure_matches_deterministic_contract():
    foundation = API.build_foundation({
        "date": "1982-04-15",
        "time": "07:38:00",
        "location": "Baarn, Netherlands",
        "timezone": "Europe/Amsterdam",
        "latitude": 52.211,
        "longitude": 5.287,
    })
    core = foundation["core"]
    assert core["type"] == "generator"
    assert core["authority"] == "sacral"
    assert core["profile"] == "5/1"
    assert {c["channel"] for c in core["channels"]} == {"3-60", "11-56", "28-38", "32-54", "34-57", "42-53"}
    assert core["incarnation_cross"] == {
        "personality_sun": {"gate": 42, "line": 5},
        "personality_earth": {"gate": 32, "line": 5},
        "design_sun": {"gate": 60, "line": 1},
        "design_earth": {"gate": 56, "line": 1},
    }
    assert foundation["phs"]["verified"] is False
    assert foundation["interpretations"]["status"] == "provider_not_configured"
    assert foundation["birth_data"]["timezone"] == "Europe/Amsterdam"

def test_transit_does_not_rewrite_natal_definition():
    foundation = API.build_foundation({
        "date": "1982-04-15", "time": "07:38:00", "location": "Baarn",
        "timezone": "Europe/Amsterdam", "latitude": 52.211, "longitude": 5.287,
    })
    natal_before = json.dumps(foundation["core"], sort_keys=True)
    transit = API.build_transit_result(foundation, datetime(2026, 10, 8, 2, 0, tzinfo=timezone.utc))
    assert transit["result"]["transit_activations"]
    assert "natal_overlap_gates" in transit["result"]
    assert json.dumps(foundation["core"], sort_keys=True) == natal_before

def test_invalid_timezone_fails_closed():
    try:
        API.build_foundation({"date": "1982-04-15", "time": "07:38:00", "timezone": "Mars/Olympus"})
    except Exception as exc:
        assert "timezone" in str(exc).lower() or "not found" in str(exc).lower() or exc.__class__.__name__ == "ZoneInfoNotFoundError"
    else:
        raise AssertionError("invalid IANA timezone should not be accepted")


def test_interpretation_provider_fails_closed_without_api_key(monkeypatch):
    import sys
    provider = sys.modules["interpretation_provider"]
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    foundation = API.build_foundation({
        "date": "1982-04-15", "time": "07:38:00", "location": "Baarn",
        "timezone": "Europe/Amsterdam", "latitude": 52.211, "longitude": 5.287,
    })
    result = provider.generate_interpretation("Explain my Gate 57.4", foundation)
    assert result["interpretation_status"] == "provider_not_configured"
    assert result["answer"] is None


def test_interpretation_provider_uses_responses_api_and_filters_evidence(monkeypatch):
    import sys
    provider = sys.modules["interpretation_provider"]
    monkeypatch.setenv("OPENAI_API_KEY", "test-secret-not-a-real-key")
    monkeypatch.setenv("OPENAI_MODEL", "gpt-5-mini")
    foundation = API.build_foundation({
        "date": "1982-04-15", "time": "07:38:00", "location": "Baarn",
        "timezone": "Europe/Amsterdam", "latitude": 52.211, "longitude": 5.287,
    })
    expected = {
        "answer": "Gate 57.4 is described in the supplied source as The Director.",
        "one_line": "Clarity in interrelationships.",
        "cards": [],
        "factual_basis": ["activations.personality", "not-a-real-evidence-id"],
        "knowledge_basis": ["EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001", "not-a-real-knowledge-id"],
        "relationship_basis": ["REL-GATE-57-LINE-4-DIRECTOR", "not-a-real-relationship-id"],
        "interpretation": "Source-specific synthesis.",
        "limitations": [],
    }
    captured = {}

    class FakeResponse:
        def __enter__(self):
            return self
        def __exit__(self, *args):
            return False
        def read(self):
            return json.dumps({"output_text": json.dumps(expected)}).encode("utf-8")

    def fake_urlopen(request, timeout):
        captured["url"] = request.full_url
        captured["headers"] = dict(request.header_items())
        captured["body"] = json.loads(request.data.decode("utf-8"))
        captured["timeout"] = timeout
        return FakeResponse()

    monkeypatch.setattr(provider, "urlopen", fake_urlopen)
    result = provider.generate_interpretation("Explain my Gate 57.4", foundation)

    assert captured["url"] == "https://api.openai.com/v1/responses"
    assert captured["body"]["model"] == "gpt-5-mini"
    assert captured["body"]["store"] is False
    assert captured["body"]["max_output_tokens"] == 1800
    assert captured["body"]["text"]["format"]["type"] == "json_object"
    assert "1982-04-15" not in captured["body"]["input"]
    assert result["interpretation_status"] == "ready"
    assert result["knowledge_basis"] == ["EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001"]
    assert result["relationship_basis"] == ["REL-GATE-57-LINE-4-DIRECTOR"]
    assert result["factual_basis"] == ["activations.personality"]


def test_ai_routes_apply_per_ip_request_limit():
    API._AI_REQUESTS_BY_IP.clear()
    instance = API.handler.__new__(API.handler)
    instance.headers = {"x-real-ip": "198.51.100.44"}
    assert all(instance._allow_ai_request() for _ in range(API.AI_RATE_MAX_REQUESTS))
    assert instance._allow_ai_request() is False
    API._AI_REQUESTS_BY_IP.clear()
