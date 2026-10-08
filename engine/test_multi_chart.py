import json
from pathlib import Path

from deterministic import derive_structure
from ephemeris import calculate_chart

ROOT = Path(__file__).resolve().parent

CASES = [
    ("1982-04-15T07:38:00", "Europe/Amsterdam"),
    ("1990-06-21T12:00:00", "Europe/Amsterdam"),
    ("1975-12-03T08:15:00", "America/New_York"),
    ("2001-03-28T18:40:00", "Asia/Singapore"),
    ("2012-09-17T23:55:00", "Australia/Sydney"),
]

def test_multi_chart_engine_invariants():
    for birth_local, timezone in CASES:
        chart = calculate_chart(birth_local, timezone)
        activations = chart["activations"]

        assert len(activations["personality"]) == 13
        assert len(activations["design"]) == 13

        for side in ("personality", "design"):
            for body, a in activations[side].items():
                assert 1 <= int(a["gate"]) <= 64
                assert 1 <= int(a["line"]) <= 6
                assert 0 <= float(a["longitude"]) < 360

        p_sun = activations["personality"]["sun"]
        p_earth = activations["personality"]["earth"]
        d_sun = activations["design"]["sun"]
        d_earth = activations["design"]["earth"]
        p_node = activations["personality"]["north_node"]
        p_snode = activations["personality"]["south_node"]

        def opposite(a, b):
            delta = (float(a["longitude"]) - float(b["longitude"])) % 360
            return min(delta, 360 - delta)

        assert opposite(p_sun, p_earth) < 1e-8
        assert opposite(d_sun, d_earth) < 1e-8
        assert opposite(p_node, p_snode) < 1e-8

        structure = derive_structure(activations)
        assert structure["type"] in {
            "generator", "manifesting_generator",
            "projector", "manifestor", "reflector", "non_generator"
        }
        assert structure["authority"] in {
            "emotional", "sacral", "splenic", "ego",
            "self_projected", "lunar_or_none"
        }
        assert len(structure["profile"].split("/")) == 2
        assert len(structure["incarnation_cross"]["gates"]) == 4

        # Every completed channel must be supported by both endpoint gates.
        gate_set = set(structure["gateSet"])
        for channel in structure["channels"]:
            a, b = map(int, channel.split("-"))
            assert a in gate_set and b in gate_set

        # Every definition component is made from defined centres only.
        defined = set(structure["centres"])
        for component in structure["definition"]["components"]:
            assert set(component).issubset(defined)
