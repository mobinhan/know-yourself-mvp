import json
from pathlib import Path

from canonical_chart import calculate_canonical_chart

GOLDEN = json.loads((Path(__file__).parent / "golden-chart.json").read_text(encoding="utf-8"))
EXPECTED_CHANNELS = {"3-60", "11-56", "28-38", "32-54", "34-57", "42-53"}


def test_canonical_chart_is_standalone_and_versioned():
    chart = calculate_canonical_chart("1982-04-15T07:38:00", "Europe/Amsterdam")
    assert chart["contract_version"] == "1.0.0"
    assert chart["provenance"]["engine_name"] == "ky-hd-engine"
    assert chart["provenance"]["ephemeris_provider"] == "Swiss Ephemeris"
    assert chart["birth_datetime_utc"] == "1982-04-15T05:38:00Z"
    assert len(chart["activations"]["personality"]) == 13
    assert len(chart["activations"]["design"]) == 13
    assert chart["canonical_sha256"]
    assert len(chart["evidence"]["activation_records"]) == 26
    assert chart["evidence"]["structure_record"]["derived_from"] == "activations"
    assert chart["provenance"]["channel_catalog_version"]


def test_canonical_chart_is_deterministic():
    args = ("1982-04-15T07:38:00", "Europe/Amsterdam")
    a = calculate_canonical_chart(*args)
    b = calculate_canonical_chart(*args)
    assert a == b


def test_golden_chart_structure_matches_expected_mechanics():
    chart = calculate_canonical_chart("1982-04-15T07:38:00", "Europe/Amsterdam")
    structure = chart["structure"]
    expected = GOLDEN["expected"]
    assert structure["type"] == expected["type"]
    assert structure["strategy"] == expected["strategy"]
    assert structure["authority"] == expected["authority"]
    assert structure["profile"] == expected["profile"]
    assert set(c["channel"] for c in structure["channels"]) == EXPECTED_CHANNELS
    assert structure["centres"] == expected["centres"]
    assert structure["definition"] == expected["definition"]
    assert structure["incarnation_cross"] == expected["incarnation_cross"]


def test_canonical_result_has_no_interpretation_or_context_dependency():
    chart = calculate_canonical_chart("1982-04-15T07:38:00", "Europe/Amsterdam")
    assert "interpretation" not in chart
    assert "memories" not in chart
    assert "user_context" not in chart
