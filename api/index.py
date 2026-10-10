"""Know Yourself v1 API — deterministic chart mechanics and 3framework interpretation.

Guest charts are computed per request and kept in the browser's local storage.
The chart engine remains deterministic; optional AI interpretation is server-side,
source-grounded, and disabled until OPENAI_API_KEY is configured.
"""
from __future__ import annotations

import json
import os
import sys
import time
import uuid
from datetime import datetime, timezone
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.parse import parse_qs, quote, urlparse
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

from timezonefinder import TimezoneFinder

ROOT = Path(__file__).resolve().parent.parent
ENGINE_DIR = ROOT / "engine"
sys.path.insert(0, str(ENGINE_DIR))
sys.path.insert(0, str(ROOT / "api"))
from ephemeris import calculate_chart  # noqa: E402
from canonical_chart import calculate_canonical_chart  # noqa: E402
from temporal_ephemeris import transit_activations  # noqa: E402
from interpretation_provider import generate_interpretation, InterpretationProviderError  # noqa: E402

CHANNEL_CATALOG = json.loads((ENGINE_DIR / "channel-catalog.json").read_text())
GATE_CATALOG = json.loads((ENGINE_DIR / "gate-catalog.json").read_text())
CHANNELS = CHANNEL_CATALOG["channels"]
TIMEZONE_FINDER = TimezoneFinder(in_memory=True)
ALLOWED_METHODS = {"GET", "POST", "OPTIONS"}
MAX_BODY_BYTES = 64_000
AI_RATE_WINDOW_SECONDS = 60
AI_RATE_MAX_REQUESTS = 10
_AI_REQUESTS_BY_IP: dict[str, list[float]] = {}


def _unique(items):
    return list(dict.fromkeys(items))


def derive_structure(activations: dict) -> dict:
    all_activations = activations["personality"] + activations["design"]
    gate_set = sorted({int(a["gate"]) for a in all_activations})
    completed = [
        {
            "channel": c["channel"],
            "gates": list(c["gates"]),
            "centres": list(c["centres"]),
        }
        for c in CHANNELS
        if all(int(g) in gate_set for g in c["gates"])
    ]
    centres = sorted({centre for c in completed for centre in c["centres"]})

    adjacency = {centre: set() for centre in centres}
    for channel in completed:
        left, right = channel["centres"]
        adjacency.setdefault(left, set()).add(right)
        adjacency.setdefault(right, set()).add(left)
    seen, components = set(), []
    for centre in sorted(adjacency):
        if centre in seen:
            continue
        stack, component = [centre], []
        seen.add(centre)
        while stack:
            current = stack.pop()
            component.append(current)
            for neighbour in sorted(adjacency[current]):
                if neighbour not in seen:
                    seen.add(neighbour)
                    stack.append(neighbour)
        components.append(sorted(component))
    components.sort(key=lambda c: c[0])
    definition_type = "none" if not components else "single" if len(components) == 1 else "split" if len(components) == 2 else "triple_split" if len(components) == 3 else "quadruple_split"

    has_sacral = "sacral" in centres
    has_solar = "solar_plexus" in centres
    has_throat = "throat" in centres
    if has_solar:
        authority = "emotional"
    elif has_sacral:
        authority = "sacral"
    elif "spleen" in centres:
        authority = "splenic"
    elif "heart" in centres:
        authority = "ego"
    elif "g" in centres and has_throat:
        authority = "self_projected"
    elif "head" in centres or "ajna" in centres:
        authority = "mental"
    else:
        authority = "lunar_or_none"

    motor_centres = {"sacral", "solar_plexus", "root", "heart"}
    throat_component = next((c for c in components if "throat" in c), [])
    motor_to_throat = any(c in motor_centres for c in throat_component)
    if has_sacral:
        chart_type = "manifesting_generator" if motor_to_throat else "generator"
    elif motor_to_throat:
        chart_type = "manifestor"
    elif not centres:
        chart_type = "reflector"
    else:
        chart_type = "projector"
    strategy = {
        "generator": "wait_to_respond",
        "manifesting_generator": "wait_to_respond_then_inform",
        "manifestor": "inform",
        "projector": "wait_for_invitation",
        "reflector": "wait_for_lunar_cycle",
    }[chart_type]

    p = {a["body"]: a for a in activations["personality"]}
    d = {a["body"]: a for a in activations["design"]}
    personality_sun, design_sun = p.get("sun", {}), d.get("sun", {})
    incarnation_cross = {
        "personality_sun": {"gate": personality_sun.get("gate"), "line": personality_sun.get("line")},
        "personality_earth": { "gate": p.get("earth", {}).get("gate"), "line": p.get("earth", {}).get("line")},
        "design_sun": {"gate": design_sun.get("gate"), "line": design_sun.get("line")},
        "design_earth": {"gate": d.get("earth", {}).get("gate"), "line": d.get("earth", {}).get("line")},
    }
    profile = f'{personality_sun["line"]}/{design_sun["line"]}' if personality_sun.get("line") and design_sun.get("line") else None
    return {
        "gate_set": gate_set,
        "channels": completed,
        "centres": centres,
        "definition": {"type": definition_type, "components": components},
        "type": chart_type,
        "strategy": strategy,
        "authority": authority,
        "profile": profile,
        "incarnation_cross": incarnation_cross,
    }


def _source_metadata():
    return {
        "engine_name": "ky-hd-engine",
        "engine_version": "1.0.0",
        "ephemeris_provider": "swiss_ephemeris",
    }


def build_foundation(birth: dict, chart_id: str | None = None) -> dict:
    required = ("date", "time", "timezone")
    if any(not isinstance(birth.get(k), str) or not birth[k].strip() for k in required):
        raise ValueError("birth.date, birth.time and birth.timezone are required")
    timezone_name = birth["timezone"].strip()
    ZoneInfo(timezone_name)  # validates the IANA timezone before any calculation
    local_datetime = f'{birth["date"].strip()}T{birth["time"].strip()}'
    canonical_chart = calculate_canonical_chart(local_datetime, timezone_name)
    activations = canonical_chart["activations"]
    structure = canonical_chart["structure"]
    calculation = {
        "ephemeris": {
            "provider": canonical_chart["provenance"]["ephemeris_provider"],
            "version": canonical_chart["provenance"]["ephemeris_version"],
            "design_offset_degrees": canonical_chart["provenance"]["design_offset_degrees"],
            "node": canonical_chart["provenance"]["node"],
        },
        "timezone": canonical_chart["provenance"]["timezone"],
        "birth_datetime_utc": canonical_chart["birth_datetime_utc"],
    }
    chart_id = chart_id or str(uuid.uuid4())
    sun = next(a for a in activations["design"] if a["body"] == "sun")
    design_north_node = next(a for a in activations["design"] if a["body"] == "north_node")
    birth_data = {
        "date": birth["date"],
        "time": birth["time"],
        "location": str(birth.get("location") or "").strip(),
        "timezone": timezone_name,
        "latitude": birth.get("latitude"),
        "longitude": birth.get("longitude"),
    }
    core = {
        "channels": structure["channels"],
        "centres": structure["centres"],
        "definition": structure["definition"],
        "type": structure["type"],
        "strategy": structure["strategy"],
        "authority": structure["authority"],
        "profile": structure["profile"],
        "incarnation_cross": structure["incarnation_cross"],
    }
    phs = {
        "determination": {
            "color": sun.get("colour"), "tone": sun.get("tone"), "base": sun.get("base"),
            "name": f'Color {sun.get("colour")}', "tone_name": f'Tone {sun.get("tone")}',
            "source": {"side": "design", "body": "sun", "gate": sun.get("gate"), "line": sun.get("line")},
            "detail_status": "mechanical_values_only",
        },
        "environment": {
            "color": design_north_node.get("colour"), "tone": design_north_node.get("tone"), "base": design_north_node.get("base"),
            "name": f'Color {design_north_node.get("colour")}', "tone_name": f'Tone {design_north_node.get("tone")}',
            "source": {"side": "design", "body": "north_node", "gate": design_north_node.get("gate"), "line": design_north_node.get("line")},
            "detail_status": "mechanical_values_only",
        },
        "body_side": {"name": "Primary Health System", "definition": "Determination + Environment"},
        "verified": False,
        "interpretation_boundary": "Only deterministic substructure values are supplied here. PHS teaching labels and interpretation are not asserted without approved record-level evidence.",
    }
    return {
        "contract_version": "1.0.0",
        "chart_id": chart_id,
        "canonical_chart": canonical_chart,
        "birth_data": birth_data,
        "calculation": {
            **_source_metadata(),
            "ephemeris_version": calculation.get("ephemeris", {}).get("version"),
            "timezone_database_version": None,
            "calculated_at_utc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        },
        "core": core,
        "activations": activations,
        "phs": phs,
        "interpretations": {"status": "provider_not_configured", "records": []},
        "transit_overlay": {
            "mode": "transit_overlay",
            "natal": {"gates": structure["gate_set"], "channels": [c["channel"] for c in structure["channels"]], "centres": structure["centres"]},
            "transit": {"gates": [], "channels": [], "centres": []},
            "temporary": {"gates": [], "channels": [], "centres": []},
            "combined": {"gates": structure["gate_set"], "channels": [c["channel"] for c in structure["channels"]], "centres": structure["centres"]},
        },
    }


def _completed(gates: set[int]) -> list[dict]:
    return [c for c in CHANNELS if all(g in gates for g in c["gates"])]


def build_transit_result(foundation: dict, at: datetime) -> dict:
    natal_activations = foundation["activations"]["personality"] + foundation["activations"]["design"]
    transit = transit_activations(at)
    natal_gates = {int(a["gate"]) for a in natal_activations}
    transit_gates = {int(a["gate"]) for a in transit}
    combined_gates = natal_gates | transit_gates
    natal_channels = _completed(natal_gates)
    transit_channels = _completed(transit_gates)
    combined_channels = _completed(combined_gates)
    natal_centres = sorted({c for channel in natal_channels for c in channel["centres"]})
    transit_centres = sorted({c for channel in transit_channels for c in channel["centres"]})
    combined_centres = sorted({c for channel in combined_channels for c in channel["centres"]})
    temporary_channels = [c for c in combined_channels if c["channel"] not in {x["channel"] for x in natal_channels}]
    temporary_centres = [c for c in combined_centres if c not in natal_centres]
    at_iso = at.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
    return {
        "id": f'{foundation["chart_id"]}:{int(at.timestamp())}',
        "chart_id": foundation["chart_id"],
        "timestamp_utc": at_iso,
        "timezone": foundation["birth_data"]["timezone"],
        "result": {
            **_source_metadata(),
            "timestamp_utc": at_iso,
            "transit_activations": transit,
            "transit_gates": sorted(transit_gates),
            "natal_overlap_gates": sorted(natal_gates & transit_gates),
            "new_transit_gates": sorted(transit_gates - natal_gates),
            "combined_gates": sorted(combined_gates),
            "combined_centres": combined_centres,
            "transit_channels": transit_channels,
            "temporary_channels": temporary_channels,
            "temporary_centres": temporary_centres,
        },
    }


def _json_bytes(value) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), default=str).encode("utf-8")


def _photon_search(query: str) -> list[dict]:
    if not query or len(query) > 180:
        raise ValueError("q must contain 1–180 characters")
    request = Request(
        "https://photon.komoot.io/api/?q=" + quote(query) + "&limit=8",
        headers={"User-Agent": "KnowYourself/0.1 (Human Design chart birthplace lookup)"},
    )
    with urlopen(request, timeout=4) as response:
        payload = json.loads(response.read().decode("utf-8"))
    results = []
    for feature in payload.get("features", []):
        props = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates", [])
        if len(coords) != 2:
            continue
        name = props.get("name") or props.get("city") or props.get("locality")
        if not name:
            continue
        display = ", ".join(str(x) for x in [name, props.get("state"), props.get("country")] if x)
        results.append({
            "name": name,
            "display_name": display,
            "latitude": float(coords[1]),
            "longitude": float(coords[0]),
            "country": props.get("country"),
        })
    return results


class handler(BaseHTTPRequestHandler):
    @staticmethod
    def _allowed_origins() -> set[str]:
        configured = os.environ.get(
            "KY_ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
        return {origin.strip() for origin in configured.split(",") if origin.strip()}

    def _send(self, status: int, payload):
        body = _json_bytes(payload)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Vary", "Origin")
        origin = self.headers.get("Origin")
        if origin and origin in self._allowed_origins():
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, x-client-info")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        origin = self.headers.get("Origin")
        if origin and origin in self._allowed_origins():
            self.send_header("Access-Control-Allow-Origin", origin)
        self.end_headers()

    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def _dispatch(self, method: str):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        route = params.get("route", [parsed.path])[0]
        segments = [s for s in route.split("/") if s]
        try:
            if len(segments) >= 2 and segments[0] == "v1" and segments[1] == "birthplaces":
                if len(segments) == 3 and segments[2] == "search" and method == "GET":
                    q = params.get("q", [""])[0]
                    return self._send(200, _photon_search(q))
                if len(segments) == 3 and segments[2] == "timezone" and method == "GET":
                    lat = float(params["latitude"][0])
                    lon = float(params["longitude"][0])
                    local_date = params["date"][0]
                    local_time = params["time"][0]
                    zone = TIMEZONE_FINDER.timezone_at(lat=lat, lng=lon)
                    if not zone:
                        return self._send(422, {"error": "timezone_not_found_for_coordinates"})
                    local = datetime.fromisoformat(f"{local_date}T{local_time}").replace(tzinfo=ZoneInfo(zone))
                    offset = local.utcoffset()
                    return self._send(200, {"timezone": zone, "utc_offset_at_birth": offset.total_seconds() / 3600 if offset else 0, "is_dst": bool(local.dst())})
            if segments == ["v1", "charts", "calculate"] and method == "POST":
                body = self._read_json()
                if not isinstance(body, dict):
                    return self._send(400, {"error": "invalid_request"})
                local_datetime = body.get("birth_datetime_local")
                timezone_name = body.get("timezone")
                if not isinstance(local_datetime, str) or not isinstance(timezone_name, str):
                    return self._send(400, {"error": "invalid_request", "message": "birth_datetime_local and timezone are required"})
                artifact = calculate_canonical_chart(local_datetime, timezone_name)
                return self._send(200, {"contract_version": "1", "chart": artifact, "provenance": artifact["provenance"]})
            if segments[:2] == ["v1", "charts"] and len(segments) == 2 and method == "POST":
                body = self._read_json()
                birth = body.get("birth") if isinstance(body, dict) else None
                foundation = build_foundation(birth or {})
                return self._send(201, {"id": foundation["chart_id"], "chart_type": "natal", "foundation": foundation})
            if segments[:2] == ["v1", "charts"] and len(segments) >= 3:
                chart_id = segments[2]
                if len(segments) == 4 and segments[3] == "foundation" and method == "GET":
                    return self._send(410, {"error": "guest_chart_is_stateless", "message": "Use the foundation returned by POST /v1/charts. Guest chart artifacts are not stored on the server."})
                if len(segments) == 4 and segments[3] == "today" and method == "POST":
                    body = self._read_json()
                    foundation = build_foundation(body.get("birth") or {}, chart_id=chart_id)
                    at_raw = body.get("at")
                    at = datetime.fromisoformat(str(at_raw).replace("Z", "+00:00")) if at_raw else datetime.now(timezone.utc)
                    if at.tzinfo is None:
                        at = at.replace(tzinfo=timezone.utc)
                    transit = build_transit_result(foundation, at)
                    if not self._allow_ai_request():
                        return self._send(429, {"error": "ai_rate_limit_exceeded", "retry_after_seconds": AI_RATE_WINDOW_SECONDS})
                    try:
                        reading = generate_interpretation(
                            "Explain the current transit overlay in relation to this natal design. Focus on verified overlaps, newly activated gates, temporary channels and what to observe; do not imply the natal chart has changed.",
                            foundation,
                            temporal_context=transit["result"],
                        )
                    except InterpretationProviderError:
                        return self._send(503, {"error": "interpretation_provider_unavailable", "interpretation_status": "provider_error"})
                    if reading.get("interpretation_status") == "provider_not_configured":
                        reading = {
                            **reading,
                            "one_line": "Transit mechanics are calculated. Personalised AI interpretation is not connected yet.",
                            "cards": [],
                            "boundaries": ["Natal mechanics remain unchanged.", "Transit activations are temporary.", "No AI interpretation has been generated."],
                        }
                    else:
                        reading["status"] = reading.get("interpretation_status", "ready")
                        reading["boundaries"] = [
                            "Natal activations remain distinct from temporary transit activations.",
                            "Interpretation is grounded in the supplied chart and temporal evidence.",
                        ]
                    return self._send(200, {
                        "chart_id": chart_id,
                        "transit": transit,
                        "reading": reading,
                    })
                if len(segments) == 5 and segments[3] == "questions" and segments[4] == "context" and method == "POST":
                    body = self._read_json()
                    foundation = build_foundation(body.get("birth") or {}, chart_id=chart_id)
                    question = str(body.get("question") or "").strip()
                    if not question or len(question) > 4000:
                        return self._send(400, {"error": "question_must_be_1_to_4000_characters"})
                    at_raw = body.get("at")
                    temporal_context = None
                    needs_temporal = bool(at_raw) or any(token in question.lower() for token in ("today", "now", "transit", "current moment", "right now"))
                    if needs_temporal:
                        at = datetime.fromisoformat(str(at_raw).replace("Z", "+00:00")) if at_raw else datetime.now(timezone.utc)
                        if at.tzinfo is None:
                            at = at.replace(tzinfo=timezone.utc)
                        temporal_context = build_transit_result(foundation, at)["result"]
                    if not self._allow_ai_request():
                        return self._send(429, {"error": "ai_rate_limit_exceeded", "retry_after_seconds": AI_RATE_WINDOW_SECONDS})
                    try:
                        interpretation = generate_interpretation(question, foundation, temporal_context=temporal_context)
                    except InterpretationProviderError:
                        return self._send(503, {"error": "interpretation_provider_unavailable", "interpretation_status": "provider_error"})
                    return self._send(200, {
                        "chart": foundation["core"],
                        "activations": foundation["activations"],
                        "phs": foundation["phs"],
                        "question": question,
                        "interpretation_status": interpretation.get("interpretation_status", "provider_error"),
                        "evidence_status": "mechanics_recalculated_from_birth_data",
                        **interpretation,
                        "temporal_context": temporal_context,
                    })
            if segments[:3] == ["v1", "knowledge", "gates"] and len(segments) == 3 and method == "GET":
                return self._send(200, GATE_CATALOG["gates"])
            if segments[:3] == ["v1", "knowledge", "gates"] and len(segments) == 4 and method == "GET":
                gate = int(segments[3])
                if not 1 <= gate <= 64:
                    return self._send(404, {"error": "gate_not_found"})
                record = next((g for g in GATE_CATALOG["gates"] if int(g["gate"]) == gate), None)
                return self._send(200, {
                    "gate": gate,
                    "title": (record or {}).get("title") or f"Gate {gate}",
                    "detail_status": "catalogue_only",
                    "channels": [c["channel"] for c in CHANNELS if gate in c["gates"]],
                    "source_ids": (record or {}).get("source_ids", ["SRC_KY_ENGINE"]),
                    "note": "Detailed teaching is not served by this public endpoint until record-level rights and publication review permits it.",
                })
            if segments[:3] == ["v1", "knowledge", "channels"] and len(segments) == 3 and method == "GET":
                return self._send(200, CHANNEL_CATALOG["channels"])
            if segments[:3] == ["v1", "knowledge", "channels"] and len(segments) == 4 and method == "GET":
                requested = segments[3].replace("%2D", "-")
                channel = next((c for c in CHANNELS if c["channel"] == requested), None)
                if not channel:
                    return self._send(404, {"error": "channel_not_found"})
                return self._send(200, {**channel, "title": f"Channel {requested}", "detail_status": "mechanical_catalogue_only"})
            if segments[:3] == ["v1", "knowledge", "centres"] and len(segments) == 3 and method == "GET":
                return self._send(200, GATE_CATALOG["centres"])
            return self._send(404, {"error": "route_not_found", "route": route})
        except (ValueError, KeyError, TypeError) as exc:
            return self._send(400, {"error": "invalid_request", "message": str(exc)})
        except URLError:
            return self._send(503, {"error": "birthplace_provider_unavailable"})
        except Exception:
            return self._send(500, {"error": "calculation_failed", "message": "The request could not be completed safely."})

    def _allow_ai_request(self) -> bool:
        # Lightweight per-warm-instance protection for the public MVP endpoint.
        # Keep this alongside platform-level rate limits when available.
        forwarded = self.headers.get("x-real-ip") or self.headers.get("x-forwarded-for", "")
        client_ip = (forwarded.split(",")[0].strip() or "unknown")[:80]
        now = time.monotonic()
        recent = [stamp for stamp in _AI_REQUESTS_BY_IP.get(client_ip, []) if now - stamp < AI_RATE_WINDOW_SECONDS]
        if len(recent) >= AI_RATE_MAX_REQUESTS:
            _AI_REQUESTS_BY_IP[client_ip] = recent
            return False
        recent.append(now)
        _AI_REQUESTS_BY_IP[client_ip] = recent
        # Bound memory growth in long-lived local/dev processes.
        if len(_AI_REQUESTS_BY_IP) > 2000:
            for key in list(_AI_REQUESTS_BY_IP)[:500]:
                _AI_REQUESTS_BY_IP.pop(key, None)
        return True

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0 or length > MAX_BODY_BYTES:
            raise ValueError("request body must be between 1 byte and 64 KB")
        raw = self.rfile.read(length)
        try:
            value = json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError("request body must be valid JSON") from exc
        if not isinstance(value, dict):
            raise ValueError("request body must be a JSON object")
        return value


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), handler)
    print(f"Know Yourself Python API listening on port {port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
