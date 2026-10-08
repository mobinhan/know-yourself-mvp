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
