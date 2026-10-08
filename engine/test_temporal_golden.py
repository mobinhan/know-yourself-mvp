import json
from pathlib import Path
from datetime import datetime, timezone, timedelta
from ephemeris import calculate_chart, local_to_utc
from temporal_ephemeris import transit_activations
from temporal_edge_mechanics import find_gate_crossings

ROOT=Path(__file__).parent
GOLDEN=json.loads((ROOT/"golden-chart.json").read_text())

def test_temporal_golden_anchor():
    chart=calculate_chart("1982-04-15T07:38:00","Europe/Amsterdam")
    birth=local_to_utc("1982-04-15T07:38:00","Europe/Amsterdam")
    transit=transit_activations(birth,["sun","moon","uranus"])
    assert len(transit)==3
    assert all(1 <= x["gate"] <= 64 and 1 <= x["line"] <= 6 for x in transit)
    assert transit[0]["timestamp_utc"]==birth.isoformat().replace("+00:00","Z")
    assert chart["birth_datetime_utc"]==transit[0]["timestamp_utc"]

def test_temporal_window_is_deterministic():
    birth=local_to_utc("1982-04-15T07:38:00","Europe/Amsterdam")
    end=birth+timedelta(days=30)
    a=find_gate_crossings("uranus",birth,end,step_hours=12)
    b=find_gate_crossings("uranus",birth,end,step_hours=12)
    assert a==b
    assert a==sorted(a,key=lambda x:x["timestamp_utc"])
