import json
from pathlib import Path
from ephemeris import substructure

ROOT=Path(__file__).parent
GOLDEN=json.loads((ROOT/"golden-chart.json").read_text())

def test_substructure_ranges():
    for side in ("personality","design"):
        for a in GOLDEN["activations"][side]:
            gate,line,colour,tone,base=substructure(a["longitude"])
            assert 1 <= gate <= 64
            assert 1 <= line <= 6
            assert 1 <= colour <= 6
            assert 1 <= tone <= 6
            assert 1 <= base <= 5

def test_golden_substructure_matches_legacy_fixture():
    mismatches=[]
    for side in ("personality","design"):
        for want in GOLDEN["activations"][side]:
            got=substructure(want["longitude"])
            expected=(want["gate"],want["line"],want["colour"],want["tone"],want["base"])
            if got != expected:
                mismatches.append((side,want["body"],got,expected,want["longitude"]))
    assert not mismatches, mismatches


def test_substructure_is_continuous_and_nested():
    # The same normalized Mandala position must drive Gate -> Line -> Colour -> Tone -> Base.
    from ephemeris import GATE_SIZE_DEG, LINE_SIZE_DEG, COLOUR_SIZE_DEG, TONE_SIZE_DEG, BASE_SIZE_DEG, MANDALA_OFFSET_DEG
    eps = 1e-9
    for gate_index in range(64):
        gate_start = (gate_index * GATE_SIZE_DEG - MANDALA_OFFSET_DEG) % 360.0
        samples = [
            gate_start + eps,
            gate_start + LINE_SIZE_DEG * 0.5,
            gate_start + COLOUR_SIZE_DEG * 2.5,
            gate_start + TONE_SIZE_DEG * 4.5,
            gate_start + BASE_SIZE_DEG * 2.5,
        ]
        for lon in samples:
            gate, line, colour, tone, base = substructure(lon % 360.0)
            assert gate == GATE_ORDER[gate_index]
            assert 1 <= line <= 6
            assert 1 <= colour <= 6
            assert 1 <= tone <= 6
            assert 1 <= base <= 5
