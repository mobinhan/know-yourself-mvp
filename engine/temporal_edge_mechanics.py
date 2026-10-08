

def _angular_distance(a: float, b: float) -> float:
    return abs(_signed_delta(a, b))


def _event_direction(body: str, root_ts: float, target: float) -> str:
    """Determine direction from instantaneous longitude change around event."""
    eps = 60.0  # one minute on each side
    before = longitude(julian_day(datetime.fromtimestamp(root_ts-eps, tz=timezone.utc)), BODIES[body])
    after = longitude(julian_day(datetime.fromtimestamp(root_ts+eps, tz=timezone.utc)), BODIES[body])
    delta = _signed_delta(after, before)
    if abs(delta) < 1e-12:
        return "stationary"
    return "forward" if delta > 0 else "retrograde"


def find_gate_crossings(body: str, start_utc: datetime, end_utc: datetime,
                        step_hours: float = 6.0) -> list[dict]:
    """Find exact gate-boundary crossings, including retrograde motion.

    The returned events are mechanical boundaries only. They are useful for
    historical/future transit timelines without pretending a coarse sample
    timestamp is the actual gate-change instant.
    """
    if body not in BODIES:
        raise ValueError(f"Unknown body: {body}")
    if end_utc < start_utc:
        raise ValueError("end precedes start")
    if step_hours <= 0:
        raise ValueError("step_hours must be positive")

    start = start_utc.astimezone(timezone.utc)
    end = end_utc.astimezone(timezone.utc)
    step = timedelta(hours=step_hours)
    # Gate boundaries are equally spaced in the transformed mandala longitude.
    from ephemeris import GATE_SIZE_DEG, MANDALA_OFFSET_DEG

    def transformed(ts: float) -> float:
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
        lon = longitude(julian_day(dt), BODIES[body])
        return (lon + MANDALA_OFFSET_DEG) % 360.0

    def boundary_distance(ts: float, boundary: float) -> float:
        return _signed_delta(transformed(ts), boundary)

    events=[]
    t=start.timestamp(); stop=end.timestamp()
    next_t=min(t+step.total_seconds(), stop)
    while t < stop:
        a=transformed(t); b=transformed(next_t)
        # Check every boundary between the sampled positions, accounting for wrap.
        span=(b-a)%360.0
        if span > 180.0:
            span -= 360.0
        direction=1 if span >= 0 else -1
        distance=abs(span)
        if distance > 1e-9:
            n=max(1, int(distance/GATE_SIZE_DEG)+1)
            for k in range(1,n+1):
                boundary=(a + direction*min(k*GATE_SIZE_DEG,distance))%360.0
                if abs(_signed_delta(boundary,b)) > 1e-7:
                    continue
                root=_bisect_crossing(lambda ts: boundary_distance(ts,boundary),t,next_t)
                dt=datetime.fromtimestamp(root,tz=timezone.utc)
                gate_after,_=gate_line(longitude(julian_day(dt+timedelta(seconds=2)),BODIES[body]))
                events.append({"type":"gate_change","body":body,"timestamp_utc":_iso(dt),"gate_after":gate_after,"direction":_event_direction(body,root,boundary)})
        t,next_t=next_t,min(next_t+step.total_seconds(),stop)

    unique=[]
    seen=set()
    for e in events:
        key=(e["body"],e["timestamp_utc"])
        if key not in seen:
            seen.add(key); unique.append(e)
    return sorted(unique,key=lambda e:e["timestamp_utc"])
