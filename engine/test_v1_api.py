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
