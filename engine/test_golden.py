import json
from pathlib import Path

from ephemeris import calculate_chart

ROOT=Path(__file__).parent
GOLDEN=json.loads((ROOT/"golden-chart.json").read_text())

def test_golden_chart_activations():
    result=calculate_chart("1982-04-15T07:38:00","Europe/Amsterdam")
    expected=GOLDEN["activations"]
    for side in ("personality","design"):
        got={x["body"]:x for x in result["activations"][side]}
        want={x["body"]:x for x in expected[side]}
        assert set(got)==set(want)
        for body in want:
            assert got[body]["gate"]==want[body]["gate"],(side,body)
            assert got[body]["line"]==want[body]["line"],(side,body)
