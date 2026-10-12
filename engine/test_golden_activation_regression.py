"""Golden activation and gate/line boundary regression tests.

Reference values come from the checked-in Golden Chart fixture. This tests
calculation output against the fixture; the fixture itself must remain grounded
in the verified MMI report and must never be used to override runtime output.
"""
import json
import math
from pathlib import Path

import pytest

from ephemeris import (
    GATE_ORDER,
    GATE_SIZE_DEG,
    LINE_SIZE_DEG,
    MANDALA_OFFSET_DEG,
    calculate_chart,
    substructure,
)

ROOT = Path(__file__).parent
GOLDEN = json.loads((ROOT / "golden-chart.json").read_text())
BIRTH_LOCAL = "1982-04-15T07:38:00"
TIME_ZONE = "Europe/Amsterdam"
EPS = 1e-7


def _reference_activations():
    return {
        side: {item["body"]: item for item in activations}
        for side, activations in GOLDEN["activations"].items()
    }


def test_golden_all_planetary_gate_lines_match_reference_fixture():
    """Cover every stored Personality and Design activation, not just channels."""
    chart = calculate_chart(BIRTH_LOCAL, TIME_ZONE)
    reference = _reference_activations()

    for side in ("personality", "design"):
        actual_by_body = {item["body"]: item for item in chart["activations"][side]}
        assert actual_by_body.keys() == reference[side].keys()
        for body, expected in reference[side].items():
            actual = actual_by_body[body]
            assert (actual["gate"], actual["line"]) == (
                expected["gate"], expected["line"]
            ), f"{side} {body}: expected {expected['gate']}.{expected['line']}, got {actual['gate']}.{actual['line']}"


@pytest.mark.parametrize("side,body,expected", [
    ("personality", "north_node", (53, 2)),
    ("personality", "south_node", (54, 2)),
    ("design", "north_node", (62, 2)),
    ("design", "south_node", (61, 2)),
])
def test_golden_lunar_nodes_match_reference(side, body, expected):
    chart = calculate_chart(BIRTH_LOCAL, TIME_ZONE)
    actual = next(x for x in chart["activations"][side] if x["body"] == body)
    assert (actual["gate"], actual["line"]) == expected


def test_gate_starts_and_both_sides_of_every_gate_boundary():
    # Convert a mandala coordinate back to zodiac longitude.
    for i, gate in enumerate(GATE_ORDER):
        boundary = (i * GATE_SIZE_DEG - MANDALA_OFFSET_DEG) % 360.0
        assert substructure(boundary)[0] == gate
        assert substructure((boundary - EPS) % 360.0)[0] == GATE_ORDER[(i - 1) % 64]
        assert substructure((boundary + EPS) % 360.0)[0] == gate


def test_line_starts_and_both_sides_of_every_line_boundary():
    # Every gate has six equal lines. Test each internal line boundary.
    for i, gate in enumerate(GATE_ORDER):
        gate_start = i * GATE_SIZE_DEG - MANDALA_OFFSET_DEG
        for line_index in range(1, 6):
            boundary = (gate_start + line_index * LINE_SIZE_DEG) % 360.0
            assert substructure((boundary - EPS) % 360.0)[:2] == (gate, line_index)
            assert substructure(boundary)[:2] == (gate, line_index + 1)
            assert substructure((boundary + EPS) % 360.0)[:2] == (gate, line_index + 1)


def test_longitude_wraparound_is_periodic():
    for lon in (0.0, 1.0, 107.0, 359.999999):
        assert substructure(lon) == substructure(lon + 360.0)
        assert substructure(lon) == substructure(lon - 360.0)


@pytest.mark.parametrize("lon", [float("nan"), float("inf"), float("-inf")])
def test_non_finite_longitude_is_rejected(lon):
    with pytest.raises((ValueError, OverflowError)):
        substructure(lon)
