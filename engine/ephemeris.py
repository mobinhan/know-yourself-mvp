"""Know Yourself deterministic Human Design ephemeris layer."""
from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import swisseph as swe

GATE_ORDER = [
    25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,
    39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,
    32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60,
    41,19,13,49,30,55,37,63,22,36
]
MANDALA_OFFSET_DEG = 1.875
GATE_SIZE_DEG = 360.0 / 64.0
LINE_SIZE_DEG = GATE_SIZE_DEG / 6.0
COLOUR_SIZE_DEG = LINE_SIZE_DEG / 6.0
TONE_SIZE_DEG = COLOUR_SIZE_DEG / 6.0
BASE_SIZE_DEG = TONE_SIZE_DEG / 5.0

BODIES = {
    "sun": swe.SUN, "moon": swe.MOON, "mercury": swe.MERCURY,
    "venus": swe.VENUS, "mars": swe.MARS, "jupiter": swe.JUPITER,
    "saturn": swe.SATURN, "uranus": swe.URANUS, "neptune": swe.NEPTUNE,
    "pluto": swe.PLUTO, "north_node": swe.TRUE_NODE,
}

@dataclass(frozen=True)
class Activation:
    body: str
    imprint: str
    timestamp_utc: str
    longitude: float
    gate: int
    line: int
    colour: int
    tone: int
    base: int

def local_to_utc(local_datetime: str, iana_timezone: str) -> datetime:
    dt = datetime.fromisoformat(local_datetime)
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc)
    return dt.replace(tzinfo=ZoneInfo(iana_timezone)).astimezone(timezone.utc)

def julian_day(dt_utc: datetime) -> float:
    u = dt_utc.astimezone(timezone.utc)
    return swe.julday(u.year, u.month, u.day,
                      u.hour + u.minute/60 + u.second/3600 + u.microsecond/3600000000)

def jd_to_datetime(jd: float) -> datetime:
    y,m,d,h = swe.revjul(jd)
    hour=int(h); mf=(h-hour)*60; minute=int(mf); sf=(mf-minute)*60
    second=int(sf); micro=int(round((sf-second)*1000000))
    if micro >= 1000000:
        second += 1; micro -= 1000000
    return datetime(y,m,d,hour,minute,second,micro,tzinfo=timezone.utc)

def longitude(jd: float, body_id: int) -> float:
    values, _ = swe.calc_ut(jd, body_id)
    return float(values[0]) % 360.0

def substructure(lon: float) -> tuple[int,int,int,int,int]:
    """Return gate, line, colour, tone, base from the canonical nested divisions."""
    x = (lon + MANDALA_OFFSET_DEG) % 360.0
    gate_index = min(63, int(x / GATE_SIZE_DEG))
    within_gate = x - gate_index * GATE_SIZE_DEG
    line = min(6, int(within_gate / LINE_SIZE_DEG) + 1)
    within_line = within_gate - (line - 1) * LINE_SIZE_DEG
    colour = min(6, int(within_line / COLOUR_SIZE_DEG) + 1)
    within_colour = within_line - (colour - 1) * COLOUR_SIZE_DEG
    tone = min(6, int(within_colour / TONE_SIZE_DEG) + 1)
    within_tone = within_colour - (tone - 1) * TONE_SIZE_DEG
    base = min(5, int(within_tone / BASE_SIZE_DEG) + 1)
    return GATE_ORDER[gate_index], line, colour, tone, base

def gate_line(lon: float) -> tuple[int,int]:
    gate, line, _, _, _ = substructure(lon)
    return gate, line

def _sun_delta(jd: float, birth_sun: float) -> float:
    current=longitude(jd,swe.SUN)
    return ((current-birth_sun+180.0)%360.0)-180.0

def design_jd(birth_jd: float) -> float:
    birth_sun=longitude(birth_jd,swe.SUN)
    target=-88.0
    previous_jd=birth_jd
    previous_delta=0.0
    bracket=None
    for i in range(1,721):
        candidate=birth_jd-i*0.25
        delta=_sun_delta(candidate,birth_sun)
        if delta <= target <= previous_delta:
            bracket=(candidate,previous_jd)
            break
        previous_jd,previous_delta=candidate,delta
    if bracket is None:
        raise RuntimeError("Could not bracket the 88-degree Design Sun position.")
    lo,hi=bracket
    for _ in range(70):
        mid=(lo+hi)/2
        delta=_sun_delta(mid,birth_sun)
        if delta < target: lo=mid
        else: hi=mid
    return (lo+hi)/2

def _iso(jd: float) -> str:
    return jd_to_datetime(jd).isoformat().replace("+00:00","Z")

def _activation(body: str, imprint: str, jd: float) -> Activation:
    lon=longitude(jd,BODIES[body])
    gate,line,colour,tone,base=substructure(lon)
    return Activation(body,imprint,_iso(jd),lon,gate,line,colour,tone,base)

def calculate_activations(birth_utc: datetime) -> dict:
    birth_jd=julian_day(birth_utc)
    design=design_jd(birth_jd)
    bodies=list(BODIES.keys())
    personality=[_activation(b,"personality",birth_jd) for b in bodies]
    design_side=[_activation(b,"design",design) for b in bodies]
    for arr in (personality,design_side):
        sun=next(x for x in arr if x.body=="sun")
        earth_lon=(sun.longitude+180)%360
        eg,el,ec,et,eb=substructure(earth_lon)
        arr.insert(1,Activation("earth",arr[0].imprint,arr[0].timestamp_utc,earth_lon,eg,el,ec,et,eb))
        node=next(x for x in arr if x.body=="north_node")
        sg,sl,sc,st,sb=substructure((node.longitude+180)%360)
        idx=next(i for i,x in enumerate(arr) if x.body=="north_node")+1
        arr.insert(idx,Activation("south_node",arr[0].imprint,node.timestamp_utc,
                                   (node.longitude+180)%360,sg,sl,sc,st,sb))
    return {"personality":[asdict(x) for x in personality],
            "design":[asdict(x) for x in design_side]}

def calculate_chart(local_datetime: str, iana_timezone: str) -> dict:
    birth_utc=local_to_utc(local_datetime,iana_timezone)
    return {
        "birth_datetime_local":local_datetime,
        "timezone":iana_timezone,
        "birth_datetime_utc":birth_utc.isoformat().replace("+00:00","Z"),
        "ephemeris":{"provider":"Swiss Ephemeris","version":getattr(swe,"version","unknown"),
                     "node":"true","design_offset_degrees":88.0},
        "activations":calculate_activations(birth_utc),
    }
