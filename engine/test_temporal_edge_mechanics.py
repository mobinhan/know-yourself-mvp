from datetime import datetime, timezone, timedelta
from ephemeris import BODIES, gate_line, julian_day, longitude
from temporal_ephemeris import find_longitude_event, find_gate_crossings

start = datetime(2024, 1, 1, tzinfo=timezone.utc)
end = datetime(2024, 1, 3, tzinfo=timezone.utc)

# Exact Sun return at the starting instant must be retained.
jd = julian_day(start)
sun_lon = longitude(jd, BODIES["sun"])
events = find_longitude_event("sun", sun_lon, start, end, target_degrees=0)
assert events
assert events[0]["type"] == "sun_return"
assert events[0]["timestamp"] == "2024-01-01T00:00:00Z"

# Opposition uses the same deterministic event machinery.
opposition = find_longitude_event("sun", sun_lon, start, end, target_degrees=180)
assert isinstance(opposition, list)

# Gate-crossing output is ordered and mechanically shaped.
crossings = find_gate_crossings("sun", start, start + timedelta(days=30), step_hours=6)
assert crossings == sorted(crossings, key=lambda x: x["timestamp_utc"])
for event in crossings:
    assert event["type"] == "gate_change"
    assert 1 <= event["gate_after"] <= 64
    assert event["direction"] in {"forward", "retrograde", "stationary"}

# Invalid temporal requests must fail deterministically.
try:
    find_gate_crossings("sun", end, start)
    raise AssertionError("expected invalid range")
except ValueError:
    pass

print("TEMPORAL EDGE MECHANICS PASS")
