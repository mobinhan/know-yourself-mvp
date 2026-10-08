from ephemeris import calculate_chart

CASES = [
    ("1982-04-15T07:38:00", "Europe/Amsterdam"),
    ("1990-06-21T12:00:00", "Europe/Amsterdam"),
    ("1975-12-03T08:15:00", "America/New_York"),
    ("2001-03-28T18:40:00", "Asia/Singapore"),
    ("2012-09-17T23:55:00", "Australia/Sydney"),
]

def test_multi_chart_ephemeris_invariants():
    for birth_local, timezone in CASES:
        chart = calculate_chart(birth_local, timezone)
        for side in ("personality", "design"):
            activations = chart["activations"][side]
            assert len(activations) == 13
            for a in activations:
                assert 1 <= int(a["gate"]) <= 64
                assert 1 <= int(a["line"]) <= 6
                assert 0 <= float(a["longitude"]) < 360

        for side in ("personality", "design"):
            by_body = {a["body"]: a for a in chart["activations"][side]}
            assert abs(((by_body["sun"]["longitude"] + 180) % 360) - by_body["earth"]["longitude"]) < 1e-9
            assert abs(((by_body["north_node"]["longitude"] + 180) % 360) - by_body["south_node"]["longitude"]) < 1e-9
