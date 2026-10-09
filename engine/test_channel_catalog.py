import json
from pathlib import Path

ROOT = Path(__file__).parent
CATALOG = json.loads((ROOT / "channel-catalog.json").read_text())
GATES = json.loads((ROOT / "gate-catalog.json").read_text())

def test_channel_catalog_is_complete_and_well_formed():
    channels = CATALOG["channels"]
    assert len(channels) == 36
    ids = [c["channel"] for c in channels]
    assert len(ids) == len(set(ids))
    for channel in channels:
        gates = channel["gates"]
        assert len(gates) == 2
        assert all(isinstance(g, int) and 1 <= g <= 64 for g in gates)
        assert channel["channel"] == "-".join(map(str, sorted(gates)))
        assert len(channel["centres"]) == 2
        assert channel["source_ids"], channel["channel"]

def test_gate_catalog_covers_all_64_gates():
    gates = GATES["gates"]
    assert len(gates) == 64
    assert {int(g["gate"]) for g in gates} == set(range(1, 65))
    assert len(GATES["centres"]) == 9

def test_golden_chart_channels_are_in_catalog():
    ids = {c["channel"] for c in CATALOG["channels"]}
    assert {"3-60", "11-56", "28-38", "32-54", "34-57", "42-53"} <= ids
