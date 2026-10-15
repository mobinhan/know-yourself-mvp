"""KY v1 additions: chart-save, lifecycles, connection (with free-tier teasers),
and the trusted conversation-answer endpoint.

Deployed as a separate module so api/index.py only needs a one-line import,
a one-line configure() call and a one-line dispatch hook.
"""

from __future__ import annotations

import hashlib
import json
import os
import time
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from temporal_ephemeris import transit_activations

REPO_ROOT = Path(__file__).resolve().parents[1]

# Injected by api/index.py at startup (avoids circular imports).
_DEPS: dict = {}


def configure(build_foundation=None, source_metadata=None, send_json=None) -> None:
    if build_foundation is not None:
        _DEPS["build_foundation"] = build_foundation
    if source_metadata is not None:
        _DEPS["source_metadata"] = source_metadata
    if send_json is not None:
        _DEPS["send_json"] = send_json


def _build_foundation(birth: dict, chart_id: str | None = None) -> dict:
    fn = _DEPS["build_foundation"]
    return fn(birth) if chart_id is None else fn(birth, chart_id=chart_id)


def _reply(handler, status: int, payload: dict):
    # ADAPT-IF-NEEDED: use the same response sender the other routes in
    # api/index.py use (e.g. handler._send_json(status, payload)).
    sender = _DEPS.get("send_json")
    if sender is not None:
        return sender(handler, status, payload)
    return handler._send_json(status, payload)


def _read_body(handler) -> dict:
    try:
        length = int(handler.headers.get("Content-Length") or 0)
    except (TypeError, ValueError):
        return {}
    if length <= 0 or length > 65536:
        return {}
    try:
        return json.loads(handler.rfile.read(length) or b"{}")
    except Exception:
        return {}


def _public_error(decision: dict):
    # Mirror the error mapping used by the existing premium routes in api/index.py.
    status = decision.get("status")
    if status == "authentication_required":
        return 401, {"error": "authentication_required"}
    if status == "premium_required":
        return 403, {"error": "premium_required", "capability": decision.get("capability")}
    return 503, {"error": "entitlement_unavailable", "capability": decision.get("capability")}


# ---------------------------------------------------------------- Supabase --

_SERVICE_ROLE = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SB_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SB_ANON = os.environ.get("SUPABASE_ANON_KEY", "")


def _verify_user_id(headers) -> str | None:
    auth = (headers.get("Authorization") or "").strip()
    if not auth.startswith("Bearer "):
        return None
    try:
        req = Request(SB_URL + "/auth/v1/user", headers={"apikey": SB_ANON, "Authorization": auth, "Accept": "application/json"})
        with urlopen(req, timeout=8) as resp:
            user = json.loads(resp.read().decode("utf-8"))
        uid = user.get("id") if isinstance(user, dict) else None
        return uid if isinstance(uid, str) and uid else None
    except Exception:
        return None


def _service_request(method: str, path: str, payload=None):
    req = Request(
        SB_URL + "/rest/v1/" + path,
        method=method,
        data=json.dumps(payload).encode("utf-8") if payload is not None else None,
        headers={
            "apikey": _SERVICE_ROLE,
            "Authorization": "Bearer " + _SERVICE_ROLE,
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Prefer": "return=representation",
        },
    )
    with urlopen(req, timeout=15) as resp:
        raw = resp.read().decode("utf-8")
    return json.loads(raw) if raw else []


# ------------------------------------------------------------- chart save --

def handle_save_chart(handler):
    if not _SERVICE_ROLE:
        return _reply(handler, 503, {"error": "chart_storage_not_configured"})
    body = _read_body(handler)
    user_id = _verify_user_id(handler.headers)
    if not user_id:
        return _reply(handler, 401, {"error": "authentication_required"})
    try:
        from entitlements import resolve_request_capability
        decision = resolve_request_capability(handler.headers, "guide.basic")
    except Exception:
        decision = {"allowed": True}
    if not decision.get("allowed"):
        status, payload = _public_error(decision)
        return _reply(handler, status, payload)
    try:
        foundation = _build_foundation(body.get("birth") or {})
    except ValueError as exc:
        return _reply(handler, 422, {"error": "validation_failed", "detail": str(exc)})

    # Canonical artifact is engine-computed and never client-writable.
    canonical = {"contract_version": foundation.get("contract_version"), "foundation": foundation}
    fingerprint = hashlib.sha256(
        json.dumps(canonical, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()

    existing = _service_request(
        "GET", "ky_charts?select=id&user_id=eq." + user_id + "&chart_fingerprint=eq." + fingerprint + "&limit=1"
    )
    if existing:
        return _reply(handler, 200, {"chart": existing[0], "already_saved": True})

    if body.get("is_primary"):
        _service_request("PATCH", "ky_charts?user_id=eq." + user_id + "&is_primary=eq.true", {"is_primary": False})

    meta = _DEPS.get("source_metadata") or (lambda: {})()
    bd = foundation["birth_data"]
    row = {
        "user_id": user_id,
        "label": str(body.get("label") or "My Chart")[:120],
        "birth_date": bd["date"],
        "birth_time": bd["time"] + (":00" if len(bd["time"]) == 5 else ""),
        "birth_timezone": bd["timezone"],
        "birth_location_label": bd.get("location", ""),
        "engine_name": foundation.get("engine") or meta.get("engine") or "ky-hd-engine",
        "engine_version": foundation.get("engine_version") or meta.get("engine_version") or "1.0.0",
        "canonical_chart": canonical,
        "chart_fingerprint": fingerprint,
        "is_primary": bool(body.get("is_primary")),
    }
    inserted = _service_request("POST", "ky_charts", row)
    return _reply(handler, 201, {"chart": inserted[0] if inserted else row})


# -------------------------------------------------------------- lifecycles --

_LIFECYCLE_SPECS = [
    ("saturn_opposition", "saturn", 14.728, 180.0),
    ("saturn_return", "saturn", 29.457, 0.0),
    ("uranus_opposition", "uranus", 41.9, 180.0),
    ("chiron_return", "chiron", 50.7, 0.0),
]


def _angle_diff(lon, target):
    return ((lon - target + 180.0) % 360.0) - 180.0


def _natal_longitude(foundation, body_name):
    for side in ("personality", "design"):
        for act in (foundation.get("activations", {}).get(side) or []):
            if str(act.get("body", "")).lower() == body_name:
                return float(act["longitude"])
    return None


def _transit_longitude(at_dt, body_name):
    try:
        acts = transit_activations(at_dt)
    except Exception:
        return None
    for act in acts or []:
        if str(act.get("body", "")).lower() == body_name:
            return float(act["longitude"])
    return None


def _find_exact_time(body_name, target_lon, approx_dt, window_days=900):
    step = (2 * window_days * 86400) / 200.0
    start = approx_dt.timestamp() - window_days * 86400
    prev_d = None
    for i in range(201):
        t = start + i * step
        lon = _transit_longitude(datetime.fromtimestamp(t, tz=timezone.utc), body_name)
        if lon is None:
            return None
        d = _angle_diff(lon, target_lon)
        if prev_d is not None and ((prev_d < 0) != (d < 0)):
            lo, hi = t - step, t
            for _ in range(48):
                mid = (lo + hi) / 2
                md = _angle_diff(_transit_longitude(datetime.fromtimestamp(mid, tz=timezone.utc), body_name), target_lon)
                if (md < 0) == (d < 0):
                    hi = mid
                else:
                    lo = mid
            return datetime.fromtimestamp((lo + hi) / 2, tz=timezone.utc)
        prev_d = d
    return None


def _compute_lifecycle_events(foundation):
    birth_dt = datetime.fromisoformat(
        foundation["birth_data"]["date"] + "T" + foundation["birth_data"]["time"]
    ).replace(tzinfo=ZoneInfo(foundation["birth_data"]["timezone"]))
    events, unavailable = [], []
    for event_id, body_name, nominal_years, offset in _LIFECYCLE_SPECS:
        natal = _natal_longitude(foundation, body_name)
        if natal is None:
            unavailable.append(body_name)
            continue
        approx = (birth_dt + timedelta(days=nominal_years * 365.25)).astimezone(timezone.utc)
        exact = _find_exact_time(body_name, (natal + offset) % 360.0, approx)
        if exact is None:
            unavailable.append(body_name)
            continue
        events.append({
            "event_id": event_id,
            "type": "lifecycle_event",
            "timestamp": exact.isoformat().replace("+00:00", "Z"),
            "source_body": body_name,
            "event_kind": "opposition" if offset else "return",
            "nominal_age_years": round((exact - birth_dt.astimezone(timezone.utc)).days / 365.25, 1),
        })
    events.sort(key=lambda e: e["timestamp"])
    return events, unavailable, birth_dt


def handle_lifecycles(handler, chart_id):
    from entitlements import resolve_request_capability
    body = _read_body(handler)
    decision = resolve_request_capability(handler.headers, str(body.get("capability") or "lifecycles.full"))
    try:
        foundation = _build_foundation(body.get("birth") or {}, chart_id=chart_id)
    except ValueError as exc:
        return _reply(handler, 422, {"error": "validation_failed", "detail": str(exc)})

    events, unavailable, _birth_dt = _compute_lifecycle_events(foundation)

    # Teaser for everyone without the premium capability: exact NEXT event only.
    if not decision.get("allowed"):
        now = datetime.now(timezone.utc)
        future = [e for e in events if datetime.fromisoformat(e["timestamp"].replace("Z", "+00:00")) >= now]
        return _reply(handler, 200, {
            "access": "teaser",
            "chart_id": foundation["chart_id"],
            "next_event": future[0] if future else (events[-1] if events else None),
            "total_events": len(events),
            "unavailable": unavailable,
        })

    meta = _DEPS.get("source_metadata") or (lambda: {})()
    return _reply(handler, 200, {
        "access": "full",
        "chart_id": foundation["chart_id"],
        "engine": {"engine": foundation.get("engine") or meta.get("engine"),
                   "engine_version": foundation.get("engine_version") or meta.get("engine_version")},
        "events": events,
        "unavailable": unavailable,
    })


# --------------------------------------------------------------- connection --

def _load_channel_catalog():
    data = json.loads((REPO_ROOT / "engine" / "channel-catalog.json").read_text(encoding="utf-8"))
    catalog = []
    for item in data:
        if isinstance(item, dict):
            catalog.append({
                "channel": str(item.get("channel") or item.get("name")),
                "gates": [int(g) for g in item.get("gates", [])],
                "centres": list(item.get("centres", [])),
            })
        elif isinstance(item, (list, tuple)) and len(item) >= 2:
            catalog.append({
                "channel": str(item[0]),
                "gates": [int(g) for g in item[1]],
                "centres": [str(c) for c in (item[2] if len(item) > 2 else [])],
            })
    return catalog


def _natal_gate_set(foundation):
    gates = set()
    for side in ("personality", "design"):
        for act in foundation.get("activations", {}).get(side) or []:
            gates.add(int(act["gate"]))
    return gates


def _classify_connection(gates_a, gates_b, catalog):
    ga, gb = set(gates_a), set(gates_b)

    def completes(gates, ch):
        return set(ch["gates"]) <= gates

    electromagnetic, compromise, mutual = [], [], []
    for ch in catalog:
        ca, cb = completes(ga, ch), completes(gb, ch)
        pair = set(ch["gates"])
        if ca and cb:
            mutual.append(ch["channel"])
        elif (ca and gb & pair) or (cb and ga & pair):
            electromagnetic.append({"channel": ch["channel"], "gates": ch["gates"], "centres": ch.get("centres", [])})
        elif (ga & pair) and (gb & pair):
            compromise.append({"channel": ch["channel"], "gates": ch["gates"], "centres": ch.get("centres", [])})
    combined = sorted(ga | gb)
    return {
        "shared_gates": sorted(ga & gb),
        "chart_a": {"gates": sorted(ga), "channels": sorted(c["channel"] for c in catalog if completes(ga, c))},
        "chart_b": {"gates": sorted(gb), "channels": sorted(c["channel"] for c in catalog if completes(gb, c))},
        "electromagnetic_channels": electromagnetic,
        "compromise_channels": compromise,
        "mutual_complete_channels": mutual,
        "combined": {"gates": combined, "channels": sorted(c["channel"] for c in catalog if completes(set(combined), c))},
    }


def handle_connection(handler, chart_id):
    from entitlements import resolve_request_capability
    body = _read_body(handler)
    decision = resolve_request_capability(handler.headers, str(body.get("capability") or "connection.comparison"))
    try:
        fa = _build_foundation(body.get("birth") or {}, chart_id=chart_id)
        fb = _build_foundation(body.get("other_birth") or {}, chart_id=chart_id + "-other")
    except ValueError as exc:
        return _reply(handler, 422, {"error": "validation_failed", "detail": str(exc)})

    result = _classify_connection(_natal_gate_set(fa), _natal_gate_set(fb), _load_channel_catalog())

    # Teaser for non-premium: counts + a sample, no channel analysis.
    if not decision.get("allowed"):
        return _reply(handler, 200, {
            "access": "teaser",
            "connection_id": str(uuid.uuid4()),
            "shared_gate_count": len(result["shared_gates"]),
            "sample_shared_gates": result["shared_gates"][:3],
            "electromagnetic_count": len(result["electromagnetic_channels"]),
            "mutual_complete_count": len(result["mutual_complete_channels"]),
            "combined_gate_count": len(result["combined"]["gates"]),
            "combined_channel_count": len(result["combined"]["channels"]),
        })

    result["access"] = "full"
    result["connection_id"] = str(uuid.uuid4())
    # Mechanics only - compatibility/dominance interpretation stays forbidden.
    return _reply(handler, 200, result)


# ---------------------------------------------------- conversation answer --

_AI_LIMIT = 10
_ai_calls: dict = {}


def handle_answer(handler):
    from entitlements import resolve_request_capability
    from interpretation_provider import InterpretationProviderError, generate_interpretation

    body = _read_body(handler)
    user_id = _verify_user_id(handler.headers)
    if not user_id:
        return _reply(handler, 401, {"error": "authentication_required"})
    if not _SERVICE_ROLE:
        return _reply(handler, 503, {"error": "conversation_storage_not_configured"})

    question = str(body.get("question") or "").strip()
    if not (1 <= len(question) <= 2000):
        return _reply(handler, 422, {"error": "validation_failed", "detail": "question must be 1-2000 characters"})

    decision = resolve_request_capability(handler.headers, str(body.get("capability") or "guide.basic"))
    if not decision.get("allowed"):
        status, payload = _public_error(decision)
        return _reply(handler, status, payload)

    now = time.time()
    window = [t for t in _ai_calls.get(user_id, []) if now - t < 60]
    if len(window) >= _AI_LIMIT:
        return _reply(handler, 429, {"error": "ai_rate_limit_exceeded", "retry_after_seconds": max(1, 60 - int(now - window[0]))})

    try:
        foundation = _build_foundation(body.get("birth") or {})
    except ValueError as exc:
        return _reply(handler, 422, {"error": "validation_failed", "detail": str(exc)})

    conversation_id = body.get("conversation_id")
    if conversation_id:
        owned = _service_request(
            "GET", "ky_conversations?select=id&id=eq." + str(conversation_id) + "&user_id=eq." + user_id + "&limit=1"
        )
        if not owned:
            return _reply(handler, 404, {"error": "conversation_not_found"})
    else:
        created = _service_request("POST", "ky_conversations", {
            "user_id": user_id,
            "title": question[:80],
            "chart_id": body.get("chart_id") or None,
            "status": "active",
        })
        conversation_id = created[0]["id"] if created else None

    # User turn via the user's own JWT (client-write-boundary compliant).
    auth = (handler.headers.get("Authorization") or "").strip()
    try:
        req = Request(
            SB_URL + "/rest/v1/rpc/ky_append_user_turn",
            method="POST",
            data=json.dumps({"p_conversation_id": conversation_id, "p_question": question}).encode("utf-8"),
            headers={"apikey": SB_ANON, "Authorization": auth, "Content-Type": "application/json", "Accept": "application/json"},
        )
        with urlopen(req, timeout=10):
            pass
    except Exception:
        pass

    _ai_calls[user_id] = window + [time.time()]
    try:
        interpretation = generate_interpretation(
            question,
            foundation,
            temporal_context=body.get("at") or None,
            knowledge_tier=decision.get("knowledge_tier") or "basic",
        )
    except InterpretationProviderError:
        return _reply(handler, 503, {"error": "interpretation_provider_unavailable"})
    except Exception:
        return _reply(handler, 503, {"error": "interpretation_provider_unavailable"})

    # Assistant turn via service role (the client insert guard skips service JWTs).
    seq_rows = _service_request(
        "GET",
        "ky_conversation_turns?select=sequence_number&conversation_id=eq." + conversation_id
        + "&order=sequence_number.desc&limit=1",
    )
    turn = _service_request("POST", "ky_conversation_turns", {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "sequence_number": (int(seq_rows[0]["sequence_number"]) + 1) if seq_rows else 1,
        "role": "assistant",
        "question": question,
        "answer": interpretation.get("one_line") or json.dumps(interpretation.get("cards") or []),
        "factual_basis": [],
        "knowledge_basis": foundation.get("interpretations", {}).get("records", []),
        "critic_result": {"status": interpretation.get("interpretation_status")},
        "reasoning_model": os.environ.get("GEMINI_MODEL") or os.environ.get("OPENAI_MODEL", "gpt-5-mini"),
        "prompt_version": "v1",
    })
    return _reply(handler, 200, {
        "conversation_id": conversation_id,
        "turn": turn[0] if turn else None,
        "interpretation": interpretation,
    })


# ----------------------------------------------------------------- dispatch --

def dispatch(handler, segments, method: str) -> bool:
    """Route KY v1 additions. Returns True when the request was handled."""
    if segments == ["v1", "charts", "save"] and method == "POST":
        handle_save_chart(handler)
        return True
    if len(segments) == 4 and segments[:2] == ["v1", "charts"] and method == "POST" and segments[3] == "lifecycles":
        handle_lifecycles(handler, segments[2])
        return True
    if len(segments) == 4 and segments[:2] == ["v1", "charts"] and method == "POST" and segments[3] == "connection":
        handle_connection(handler, segments[2])
        return True
    if segments == ["v1", "conversations", "answer"] and method == "POST":
        handle_answer(handler)
        return True
    return False
