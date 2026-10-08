"""Know Yourself deterministic temporal ephemeris.

This module extends the validated Step 1 Swiss Ephemeris boundary for:
- point-in-time transit activations
- deterministic time-series sampling
- gate-change detection
- return/opposition event bracketing

No interpretation is performed here.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timedelta, timezone
from typing import Callable

import swisseph as swe

from ephemeris import BODIES, gate_line, julian_day, longitude


@dataclass(frozen=True)
class TransitActivation:
    body: str
    timestamp_utc: str
    longitude: float
    gate: int
    line: int


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def transit_activations(at_utc: datetime, bodies: list[str] | None = None) -> list[dict]:
    dt = at_utc.astimezone(timezone.utc)
    jd = julian_day(dt)
    selected = bodies or list(BODIES.keys())
    out = []
    for body in selected:
        lon = longitude(jd, BODIES[body])
        gate, line = gate_line(lon)
        out.append(asdict(TransitActivation(body, _iso(dt), lon, gate, line)))
    return out


def sample_transits(start_utc: datetime, end_utc: datetime, step_hours: float = 24.0,
                    bodies: list[str] | None = None) -> list[dict]:
    if end_utc < start_utc:
        raise ValueError("end precedes start")
    if step_hours <= 0:
        raise ValueError("step_hours must be positive")

    out = []
    current = start_utc.astimezone(timezone.utc)
    end = end_utc.astimezone(timezone.utc)
    step = timedelta(hours=step_hours)
    while current <= end:
        out.extend(transit_activations(current, bodies))
        current += step
    if out and out[-1]["timestamp_utc"] != _iso(end):
        out.extend(transit_activations(end, bodies))
    return out


def gate_changes(samples: list[dict]) -> list[dict]:
    """Return only samples where a body's gate differs from its prior sample."""
    previous: dict[str, int] = {}
    changes = []
    for sample in samples:
        body = sample["body"]
        gate = int(sample["gate"])
        if body in previous and previous[body] != gate:
            changes.append({
                "body": body,
                "timestamp_utc": sample["timestamp_utc"],
                "from_gate": previous[body],
                "to_gate": gate,
            })
        previous[body] = gate
    return changes


def _signed_delta(a: float, b: float) -> float:
    return ((a - b + 180.0) % 360.0) - 180.0


def _event_direction(body: str, root_ts: float, target: float) -> str:
    eps = 60.0
    before = longitude(julian_day(datetime.fromtimestamp(root_ts-eps, tz=timezone.utc)), BODIES[body])
    after = longitude(julian_day(datetime.fromtimestamp(root_ts+eps, tz=timezone.utc)), BODIES[body])
    delta = _signed_delta(after, before)
    if abs(delta) < 1e-12:
        return "stationary"
    return "forward" if delta > 0 else "retrograde"


def _bisect_crossing(fn: Callable[[float], float], lo: float, hi: float,
                     iterations: int = 60) -> float:
    flo, fhi = fn(lo), fn(hi)
    if flo == 0:
        return lo
    if fhi == 0:
        return hi
    if flo * fhi > 0:
        raise ValueError("crossing is not bracketed")
    for _ in range(iterations):
        mid = (lo + hi) / 2
        fm = fn(mid)
        if fm == 0:
            return mid
        if flo * fm <= 0:
            hi, fhi = mid, fm
        else:
            lo, flo = mid, fm
    return (lo + hi) / 2


def find_longitude_event(body: str, natal_longitude: float,
                         start_utc: datetime, end_utc: datetime,
                         target_degrees: float = 0.0,
                         step_days: float = 1.0) -> list[dict]:
    """Find exact target-angle crossings for a body within a time window.

    target=0 is a return/conjunction; target=180 is an opposition.
    Both crossing directions are retained, because a transit can retrograde.
    """
    if body not in BODIES:
        raise ValueError(f"Unknown body: {body}")
    if end_utc < start_utc:
        raise ValueError("end precedes start")
    if not 0 <= target_degrees <= 360:
        raise ValueError("target_degrees out of range")

    start = start_utc.astimezone(timezone.utc)
    end = end_utc.astimezone(timezone.utc)
    step = timedelta(days=step_days)

    def fn(ts: float) -> float:
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        jd = julian_day(dt)
        lon = longitude(jd, BODIES[body])
        target = (natal_longitude + target_degrees) % 360.0
        return _signed_delta(lon, target)

    t = start.timestamp()
    stop = end.timestamp()
    next_t = min(t + step.total_seconds(), stop)
    events = []

    if t == stop and abs(fn(t)) < 1e-10:
        dt = datetime.fromtimestamp(t, tz=timezone.utc)
        return [{
            "type": f"{body}_{'return' if target_degrees == 0 else 'opposition'}",
            "body": body,
            "timestamp": _iso(dt),
            "target_degrees": target_degrees,
            "direction": _event_direction(body, t, (natal_longitude + target_degrees) % 360.0),
        }]

    while t < stop:
        a = fn(t)
        b = fn(next_t)
        if a == 0:
            root = t
        elif b == 0:
            root = next_t
        elif a * b < 0:
            root = _bisect_crossing(fn, t, next_t)
        else:
            t, next_t = next_t, min(next_t + step.total_seconds(), stop)
            continue

        direction = _event_direction(body, root, (natal_longitude + target_degrees) % 360.0)
        dt = datetime.fromtimestamp(root, tz=timezone.utc)
        events.append({
            "type": f"{body}_{'return' if target_degrees == 0 else 'opposition'}",
            "body": body,
            "timestamp": _iso(dt),
            "target_degrees": target_degrees,
            "direction": direction,
        })
        t, next_t = next_t, min(next_t + step.total_seconds(), stop)

    # Deduplicate roots that fall on a bracket boundary.
    unique = []
    seen = set()
    for event in events:
        key = event["timestamp"]
        if key not in seen:
            seen.add(key)
            unique.append(event)
    return unique


def find_gate_crossings(body: str, start_utc: datetime, end_utc: datetime,
                        step_hours: float = 6.0) -> list[dict]:
    """Find exact gate-boundary crossings, including retrograde motion."""
    if body not in BODIES:
        raise ValueError(f"Unknown body: {body}")
    if end_utc < start_utc:
        raise ValueError("end precedes start")
    if step_hours <= 0:
        raise ValueError("step_hours must be positive")

    start = start_utc.astimezone(timezone.utc)
    end = end_utc.astimezone(timezone.utc)
    step = timedelta(hours=step_hours)

    def transformed(ts: float) -> float:
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        lon = longitude(julian_day(dt), BODIES[body])
        return (lon + 58.0) % 360.0

    def boundary_distance(ts: float, boundary: float) -> float:
        return _signed_delta(transformed(ts), boundary)

    events = []
    t = start.timestamp()
    stop = end.timestamp()
    while t < stop:
        next_t = min(t + step.total_seconds(), stop)
        a = transformed(t)
        b = transformed(next_t)
        span = (b - a) % 360.0
        if span > 180.0:
            span -= 360.0
        direction = 1 if span >= 0 else -1
        distance = abs(span)

        if distance > 1e-9:
            n = max(1, int(distance / 5.625) + 1)
            for k in range(1, n + 1):
                boundary = (a + direction * min(k * 5.625, distance)) % 360.0
                if abs(_signed_delta(boundary, b)) > 1e-7:
                    continue
                root = _bisect_crossing(lambda ts: boundary_distance(ts, boundary), t, next_t)
                dt = datetime.fromtimestamp(root, tz=timezone.utc)
                gate_after, _ = gate_line(longitude(julian_day(dt + timedelta(seconds=2)), BODIES[body]))
                events.append({
                    "type": "gate_change",
                    "body": body,
                    "timestamp_utc": _iso(dt),
                    "gate_after": gate_after,
                    "direction": _event_direction(body, root, boundary),
                })
        t = next_t

    unique = []
    seen = set()
    for event in events:
        key = (event["body"], event["timestamp_utc"])
        if key not in seen:
            seen.add(key)
            unique.append(event)
    return sorted(unique, key=lambda e: e["timestamp_utc"])
