from datetime import datetime, timezone
from ephemeris import BODIES, julian_day, longitude
from temporal_ephemeris import transit_activations, sample_transits, gate_changes, find_longitude_event

start = datetime(2024, 1, 1, tzinfo=timezone.utc)
end = datetime(2024, 1, 3, tzinfo=timezone.utc)

point = transit_activations(start, ["sun", "uranus"])
assert len(point) == 2
assert all(1 <= x["gate"] <= 64 for x in point)
assert all(1 <= x["line"] <= 6 for x in point)
assert all(x["timestamp_utc"] == "2024-01-01T00:00:00Z" for x in point)

samples = sample_transits(start, end, step_hours=24, bodies=["sun"])
assert len(samples) == 3
assert samples[0]["timestamp_utc"] == "2024-01-01T00:00:00Z"
assert samples[-1]["timestamp_utc"] == "2024-01-03T00:00:00Z"

changes = gate_changes(samples)
assert isinstance(changes, list)
if changes:
    assert changes[0]["body"] == "sun"
    assert changes[0]["from_gate"] != changes[0]["to_gate"]

jd = julian_day(start)
sun_lon = longitude(jd, BODIES["sun"])
events = find_longitude_event("sun", sun_lon, start, start)
assert len(events) == 1
assert events[0]["type"] == "sun_return"
assert events[0]["timestamp"] == "2024-01-01T00:00:00Z"

print("TEMPORAL EPHEMERIS PASS")
