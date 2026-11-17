"""Dedicated Uranus Opposition report pipeline.

This replaces the generic report-section template for the Uranus Opposition
product. It assembles deterministic natal, exact-cycle, and combined evidence,
then asks the active 3framework provider to synthesize each chapter directly.
No chart mechanics are inferred from prose and no post-synthesis critic is used.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo
from typing import Callable
import json
import re
import tempfile
from pathlib import Path


CHAPTERS = [
    ("natal_foundation", "The design beneath your story",
     "Explain the complete natal foundation: Type, Strategy, Authority, Profile, Definition and all completed natal channels. Make this the stable baseline for the whole report."),
    ("natal_cross", "The purpose within limitation",
     "Interpret the natal Incarnation Cross from the four exact Personality/Design Sun and Earth activations. Explain the four-gate synthesis, not four disconnected definitions."),
    ("natal_nodes", "The landscape that shaped your perspective",
     "Interpret the natal Personality and Design South-to-North Node axes. Keep the two sides distinct and explain landscape/perspective rather than predicting events."),
    ("cycle_timing", "The Uranus Opposition: timing and threshold",
     "Explain natal Uranus, every exact opposition pass, the direct/retrograde sequence, the selected reference pass, and its exact UTC/local timestamp. Distinguish the exact pass from nominal age."),
    ("cycle_foundation", "The temporary design around the cycle",
     "Explain the cycle chart at the selected exact pass: Type, Strategy, Authority, Profile, Definition and cycle channels. Explicitly state that these are temporary cycle mechanics and do not replace natal mechanics."),
    ("cycle_cross", "The Cross of Penetration: what seeks to come through",
     "Interpret the cycle Incarnation Cross from its four exact Sun/Earth activations as a coherent temporary theme."),
    ("cycle_nodes", "The new landscape: from the familiar into experience",
     "Interpret the cycle Personality and Design Node axes, keeping them distinct from natal Nodes."),
    ("node_synthesis", "Two landscapes meeting",
     "Synthesize the natal and cycle Node landscapes. Explain continuity and contrast without treating either as prediction."),
    ("profile_synthesis", "The long arc of the natal profile",
     "Explore the natal Profile as the enduring baseline and compare it carefully with the temporary cycle Profile. Do not imply the cycle profile replaces the natal one."),
    ("natal_channels", "The channels that form your foundation",
     "Synthesize all completed natal channels into a few coherent themes. Do not produce a dictionary of separate channel meanings."),
    ("cycle_connections", "The cycle connections and what they bring into view",
     "Explain cycle-only channels and chart-to-chart connections. Distinguish cycle-only, electromagnetic, compromise and mutual-completion categories exactly as supplied."),
    ("three_definitions", "Three definitions: natal, cycle and combined",
     "Compare natal Definition, cycle Definition and combined-field connectivity. The combined field is a temporary overlay, never a new permanent natal definition."),
    ("central_synthesis", "The central movement of this passage",
     "Bring together natal and cycle Crosses, Nodes, Profiles, channels and combined connections into one deep, personal narrative. Keep every evidence layer distinct."),
    ("integration", "Bringing the insight into the next chapter",
     "Translate the report into practical reflection and small experiments. Anchor suggestions in the natal foundation and the temporary cycle themes; avoid prescriptive life advice."),
    ("closing", "A different relationship with what comes next",
     "Write a substantial, memorable closing synthesis. No prediction, generic reassurance or repetition of the introduction."),
]


# Injected by api/index.py so the report pipeline uses the one canonical engine.
_DEPS: dict = {}


def configure(*, build_foundation=None, calculate_chart=None,
              derive_structure=None, channel_catalog=None, send_json=None):
    if build_foundation is not None:
        _DEPS["build_foundation"] = build_foundation
    if calculate_chart is not None:
        _DEPS["calculate_chart"] = calculate_chart
    if derive_structure is not None:
        _DEPS["derive_structure"] = derive_structure
    if channel_catalog is not None:
        _DEPS["channel_catalog"] = channel_catalog
    if send_json is not None:
        _DEPS["send_json"] = send_json


def _read_body(handler):
    try:
        length = int(handler.headers.get("Content-Length") or 0)
        if length <= 0 or length > 131072:
            return {}
        return json.loads(handler.rfile.read(length) or b"{}")
    except Exception:
        return {}


def _reply(handler, status, payload):
    sender = _DEPS.get("send_json")
    return sender(handler, status, payload) if sender else handler._send(status, payload)


class UranusReportEvidenceError(ValueError):
    """Raised when required deterministic report evidence cannot be assembled."""


def _activation(foundation: dict, side: str, body: str) -> dict:
    for item in foundation.get("activations", {}).get(side, []) or []:
        if str(item.get("body", "")).lower() == body.lower():
            return item
    raise UranusReportEvidenceError(f"Missing {side} {body} activation in canonical chart.")


def _completed_channels(gates: set[int], channel_catalog: list[dict]) -> list[dict]:
    return [
        {
            "channel": str(item.get("channel") or item.get("name")),
            "gates": [int(g) for g in item.get("gates", [])],
            "centres": list(item.get("centres", [])),
        }
        for item in channel_catalog
        if isinstance(item, dict)
        and len(item.get("gates", [])) == 2
        and set(map(int, item.get("gates", []))) <= gates
    ]


def _definition(channels: list[dict]) -> dict:
    adjacency: dict[str, set[str]] = {}
    for channel in channels:
        centres = [str(x) for x in channel.get("centres", [])]
        if len(centres) != 2:
            continue
        a, b = centres
        adjacency.setdefault(a, set()).add(b)
        adjacency.setdefault(b, set()).add(a)
    seen: set[str] = set()
    components: list[list[str]] = []
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
    components.sort(key=lambda item: item[0])
    count = len(components)
    label = ("none" if count == 0 else "single" if count == 1 else
             "split" if count == 2 else "triple_split" if count == 3 else "quadruple_split")
    return {"type": label, "components": components}


def _structure(activations: dict, channel_catalog: list[dict], derive_structure: Callable) -> dict:
    all_acts = (activations.get("personality") or []) + (activations.get("design") or [])
    gates = {int(a["gate"]) for a in all_acts if isinstance(a.get("gate"), int)}
    channels = _completed_channels(gates, channel_catalog)
    centres = sorted({str(c) for ch in channels for c in ch.get("centres", [])})
    # Reuse the canonical API structural derivation for type, strategy,
    # authority, profile and Cross. The local graph helper is retained only
    # to expose the exact connected components for this evidence contract.
    canonical = derive_structure(activations)
    return {
        **canonical,
        "gate_set": sorted(gates),
        "channels": channels,
        "centres": centres,
        "definition": _definition(channels),
    }


def _chart_to_chart(natal_gates: set[int], cycle_gates: set[int],
                    channel_catalog: list[dict]) -> dict:
    cycle_only = []
    electromagnetic = []
    compromise = []
    mutual = []
    for item in channel_catalog:
        gates = set(map(int, item.get("gates", [])))
        if len(gates) != 2:
            continue
        n_complete, c_complete = gates <= natal_gates, gates <= cycle_gates
        record = {
            "channel": str(item.get("channel") or item.get("name")),
            "gates": sorted(gates),
            "centres": list(item.get("centres", [])),
        }
        if n_complete and c_complete:
            mutual.append(record)
        elif c_complete and not n_complete and not (gates & natal_gates):
            cycle_only.append(record)
        elif n_complete and bool(gates & cycle_gates):
            compromise.append(record)
        elif c_complete and bool(gates & natal_gates):
            compromise.append(record)
        elif (gates & natal_gates) and (gates & cycle_gates) and (gates & (natal_gates | cycle_gates)) == gates:
            electromagnetic.append(record)
    return {
        "cycle_only_channels": cycle_only,
        "electromagnetic_channels": electromagnetic,
        "compromise_channels": compromise,
        "mutual_complete_channels": mutual,
    }


def build_uranus_opposition_evidence(
    foundation: dict,
    *,
    calculate_chart: Callable,
    channel_catalog: list[dict],
    derive_structure: Callable,
    reference_pass_index: int = 0,
    age_window: tuple[float, float] = (39.5, 45.5),
) -> dict:
    """Build a reproducible three-layer evidence packet from deterministic data.

    `calculate_chart` must be the existing engine function accepting
    (local_datetime_iso, IANA_timezone). Exact opposition events are found with
    the existing temporal ephemeris; this module does not approximate them.
    """
    from temporal_ephemeris import find_longitude_event

    birth = foundation.get("birth_data") or {}
    zone_name = birth.get("timezone")
    if not zone_name:
        raise UranusReportEvidenceError("Birth timezone is required.")
    zone = ZoneInfo(zone_name)
    birth_local = datetime.fromisoformat(birth["date"] + "T" + birth["time"])
    birth_utc = birth_local.replace(tzinfo=zone).astimezone(timezone.utc)
    natal_core = foundation.get("core") or {}
    required_core = ("type", "strategy", "authority", "profile", "definition", "incarnation_cross", "channels", "centres")
    missing_core = [key for key in required_core if key not in natal_core or natal_core.get(key) is None]
    if missing_core:
        raise UranusReportEvidenceError("Natal foundation is incomplete: " + ", ".join(missing_core))
    # Required natal activations used by the chapter architecture.
    for side, body in (
        ("personality", "sun"), ("personality", "earth"),
        ("design", "sun"), ("design", "earth"),
        ("personality", "south_node"), ("personality", "north_node"),
        ("design", "south_node"), ("design", "north_node"),
    ):
        _activation(foundation, side, body)
    natal_uranus = _activation(foundation, "personality", "uranus")
    natal_lon = float(natal_uranus["longitude"])

    start = birth_utc + timedelta(days=age_window[0] * 365.2425)
    end = birth_utc + timedelta(days=age_window[1] * 365.2425)
    passes = find_longitude_event(
        "uranus", natal_lon, start, end,
        target_degrees=180.0, step_days=1.0,
    )
    passes = sorted(passes, key=lambda event: event["timestamp"])
    if not passes:
        raise UranusReportEvidenceError("No exact Uranus opposition pass found in the configured age window.")
    if not 0 <= reference_pass_index < len(passes):
        raise UranusReportEvidenceError(
            f"Reference pass index {reference_pass_index} is outside the {len(passes)} exact passes found."
        )

    reference = passes[reference_pass_index]
    reference_utc = datetime.fromisoformat(reference["timestamp"].replace("Z", "+00:00"))
    reference_local = reference_utc.astimezone(zone)
    cycle_calculation = calculate_chart(reference_local.replace(tzinfo=None).isoformat(), zone_name)
    cycle_activations = cycle_calculation["activations"]
    cycle_structure = _structure(cycle_activations, channel_catalog, derive_structure)
    required_cycle = ("type", "strategy", "authority", "profile", "definition", "incarnation_cross")
    missing_cycle = [key for key in required_cycle if key not in cycle_structure or cycle_structure.get(key) is None]
    if missing_cycle:
        raise UranusReportEvidenceError("Cycle chart structure is incomplete: " + ", ".join(missing_cycle))
    for side, body in (
        ("personality", "sun"), ("personality", "earth"),
        ("design", "sun"), ("design", "earth"),
        ("personality", "south_node"), ("personality", "north_node"),
        ("design", "south_node"), ("design", "north_node"),
    ):
        if not any(str(x.get("body", "")).lower() == body for x in cycle_activations.get(side, []) or []):
            raise UranusReportEvidenceError(f"Missing cycle {side} {body} activation.")

    natal_structure = foundation.get("core") or {}
    natal_gates = {int(x) for x in natal_structure.get("gate_set", [])}
    if not natal_gates:
        natal_gates = {
            int(item["gate"])
            for side in ("personality", "design")
            for item in (foundation.get("activations", {}).get(side) or [])
            if isinstance(item.get("gate"), int)
        }
    cycle_gates = set(cycle_structure["gate_set"])
    combined_gates = natal_gates | cycle_gates
    combined_channels = _completed_channels(combined_gates, channel_catalog)
    combined_centres = sorted({str(c) for ch in combined_channels for c in ch.get("centres", [])})
    combined = {
        "gate_set": sorted(combined_gates),
        "channels": combined_channels,
        "centres": combined_centres,
        "definition": _definition(combined_channels),
    }

    cycle_sun = next((x for x in cycle_activations.get("personality", []) if x.get("body") == "sun"), None)
    cycle_design_sun = next((x for x in cycle_activations.get("design", []) if x.get("body") == "sun"), None)
    if not cycle_sun or not cycle_design_sun:
        raise UranusReportEvidenceError("Cycle Sun activations are required to verify cycle Design timestamp.")

    return {
        "schema_version": "uranus-opposition-evidence.v1",
        "reference_pass_index": reference_pass_index,
        "natal": {
            "birth_data": birth,
            "core": natal_structure,
            "activations": foundation.get("activations", {}),
            "uranus": natal_uranus,
        },
        "cycle": {
            "reference_pass": {**reference, "timestamp_local": reference_local.isoformat()},
            "calculation": cycle_calculation.get("ephemeris", {}),
            "design_timestamp_utc": cycle_design_sun.get("timestamp_utc"),
            "core": cycle_structure,
            "activations": cycle_activations,
        },
        "combined": combined,
        "chart_to_chart": _chart_to_chart(natal_gates, cycle_gates, channel_catalog),
        "all_exact_passes": [
            {**event, "timestamp_local": datetime.fromisoformat(event["timestamp"].replace("Z", "+00:00")).astimezone(zone).isoformat()}
            for event in passes
        ],
        "evidence_status": {
            "locked": True,
            "source": "deterministic_chart_engine",
            "unresolved": [],
        },
    }


def generate_uranus_opposition_chapter(
    foundation: dict,
    evidence: dict,
    chapter_id: str,
    *,
    generate_interpretation: Callable,
    knowledge_tier: str = "premium",
) -> dict:
    """Generate one bounded chapter; callers can stream the 15 chapters safely."""
    if evidence.get("evidence_status", {}).get("locked") is not True:
        raise UranusReportEvidenceError("Report evidence packet is not locked.")
    match = [(i, item) for i, item in enumerate(CHAPTERS, 1) if item[0] == chapter_id]
    if not match:
        raise UranusReportEvidenceError(f"Unknown Uranus Opposition chapter: {chapter_id}")
    index, (_, title, focus) = match[0]
    temporal_context = {
        "report_type": "uranus_opposition",
        "evidence_layers": evidence,
        "layer_rules": {
            "natal": "Immutable birth chart; never overwritten by cycle mechanics.",
            "cycle": "Temporary chart calculated at the selected exact Uranus opposition pass.",
            "combined": "Temporary union/interaction of natal and cycle activations at the reference pass.",
            "authority": "Personal decision authority remains natal. A cycle-defined Solar Plexus does not replace natal authority.",
        },
    }
    question = (
        "Write a complete, substantial chapter for a premium Uranus Opposition life-cycle report. "
        "Use a warm, personal, storytelling-led voice with real interpretive depth. "
        "Do not write an encyclopedia entry or a list of disconnected definitions. "
        "Keep natal, cycle and combined evidence explicitly distinct. "
        "Do not invent facts, chart mechanics, personal history, outcomes or predictions. "
        "If the supplied evidence does not support a claim, omit it or state the limitation. "
        "The complete report evidence packet is supplied in temporal_context. "
        f"Chapter {index}/15: {title}. {focus}"
    )
    result = generate_interpretation(
        question,
        foundation,
        temporal_context=temporal_context,
        knowledge_tier=knowledge_tier,
    )
    answer = result.get("answer") if isinstance(result, dict) else None
    if not isinstance(answer, str) or not answer.strip():
        raise UranusReportEvidenceError(f"Provider returned no substantive answer for chapter {index}: {chapter_id}")
    return {
        "id": chapter_id,
        "title": title,
        "blocks": [{"type": "paragraph", "text": paragraph.strip()}
                   for paragraph in answer.split("\n\n") if paragraph.strip()],
        "provider_metadata": {
            "model": result.get("model"),
            "interpretation_status": result.get("interpretation_status"),
            "factual_basis": result.get("factual_basis", []),
            "knowledge_basis": result.get("knowledge_basis", []),
            "relationship_basis": result.get("relationship_basis", []),
            "limitations": result.get("limitations", []),
        },
    }


def generate_uranus_opposition_chapters(
    foundation: dict,
    evidence: dict,
    *,
    generate_interpretation: Callable,
    knowledge_tier: str = "premium",
) -> list[dict]:
    """Convenience batch wrapper. Production endpoints should call one chapter per request."""
    return [
        generate_uranus_opposition_chapter(
            foundation, evidence, chapter_id,
            generate_interpretation=generate_interpretation,
            knowledge_tier=knowledge_tier,
        )
        for chapter_id, _title, _focus in CHAPTERS
    ]



def handle_chapter(handler, chart_id: str):
    from entitlements import resolve_request_capability
    from interpretation_provider import InterpretationProviderError, generate_interpretation

    body = _read_body(handler)
    chapter_id = str(body.get("chapter_id") or "")
    decision = resolve_request_capability(
        handler.headers, str(body.get("capability") or "guide.basic")
    )
    if not decision.get("allowed"):
        status = 401 if decision.get("status") == "authentication_required" else (
            403 if decision.get("status") == "premium_required" else 503
        )
        return _reply(handler, status, {
            "error": decision.get("status") or "entitlement_unavailable",
            "capability": decision.get("capability"),
        })
    try:
        foundation = _DEPS["build_foundation"](body.get("birth") or {}, chart_id=chart_id)
        evidence = build_uranus_opposition_evidence(
            foundation,
            calculate_chart=_DEPS["calculate_chart"],
            derive_structure=_DEPS["derive_structure"],
            channel_catalog=_DEPS["channel_catalog"],
            reference_pass_index=int(body.get("reference_pass_index", 0)),
        )
        chapter = generate_uranus_opposition_chapter(
            foundation, evidence, chapter_id,
            generate_interpretation=generate_interpretation,
            knowledge_tier=decision.get("knowledge_tier") or "premium",
        )
    except UranusReportEvidenceError as exc:
        return _reply(handler, 422, {"error": "uranus_report_evidence_unavailable", "detail": str(exc)})
    except ValueError as exc:
        return _reply(handler, 422, {"error": "validation_failed", "detail": str(exc)})
    except InterpretationProviderError:
        return _reply(handler, 503, {"error": "interpretation_provider_unavailable"})
    except Exception:
        return _reply(handler, 503, {"error": "uranus_report_generation_unavailable"})

    return _reply(handler, 200, {
        "report_type": "uranus_opposition",
        "chapter": chapter,
        "chapter_index": next(i for i, item in enumerate(CHAPTERS, 1) if item[0] == chapter_id),
        "chapter_count": len(CHAPTERS),
        "reference_pass_index": evidence["reference_pass_index"],
        "evidence": evidence,
    })


def dispatch(handler, segments, method: str) -> bool:
    if (len(segments) == 4 and segments[:2] == ["v1", "charts"]
            and segments[3] == "uranus-opposition-chapter" and method == "POST"):
        handle_chapter(handler, segments[2])
        return True
    if segments == ["v1", "reports", "uranus-opposition", "pdf"] and method == "POST":
        handle_pdf(handler)
        return True
    return False



def handle_pdf(handler):
    from entitlements import resolve_request_capability
    from uranus_opposition_pdf import render_uranus_opposition_pdf

    body = _read_body(handler)
    decision = resolve_request_capability(
        handler.headers, str(body.get("capability") or "guide.basic")
    )
    if not decision.get("allowed"):
        status = 401 if decision.get("status") == "authentication_required" else (
            403 if decision.get("status") == "premium_required" else 503
        )
        return _reply(handler, status, {
            "error": decision.get("status") or "entitlement_unavailable",
            "capability": decision.get("capability"),
        })

    chapters = body.get("chapters")
    expected_chapters = [(item[0], item[1]) for item in CHAPTERS]
    actual_chapters = (
        [(x.get("id"), x.get("title")) for x in chapters if isinstance(x, dict)]
        if isinstance(chapters, list) else []
    )
    if actual_chapters != expected_chapters:
        return _reply(handler, 422, {
            "error": "validation_failed",
            "detail": "The completed report must contain all 15 canonical chapters in master order.",
        })

    try:
        foundation = _DEPS["build_foundation"](body.get("birth") or {})
        evidence = build_uranus_opposition_evidence(
            foundation,
            calculate_chart=_DEPS["calculate_chart"],
            derive_structure=_DEPS["derive_structure"],
            channel_catalog=_DEPS["channel_catalog"],
            reference_pass_index=int(body.get("reference_pass_index", 0)),
        )
        birth = foundation["birth_data"]
        passes = evidence["all_exact_passes"]
        period = (
            f'{passes[0]["timestamp_local"][:10]} – {passes[-1]["timestamp_local"][:10]}'
        )
        natal = evidence["natal"]["core"]
        cycle = evidence["cycle"]["core"]
        report_data = {
            "title": "The Uranus Opposition",
            "subtitle": "A personal Human Design life-cycle reading",
            "client_name": str(body.get("client_name") or "")[:120],
            "birth": {
                "date_time": f'{birth["date"]} · {birth["time"]}',
                "place": str(birth.get("location") or ""),
            },
            "cycle_period": period,
            "evidence_status": evidence["evidence_status"],
            "validation_warnings": [],
            "evidence": evidence,
            "introduction": body.get("introduction") or {
                "heading": "A turning point within a longer journey",
                "paragraphs": [
                    "Your reading begins with the design you were born with. It then looks at the particular configuration surrounding your Uranus Opposition and asks what this cycle brings into view.",
                    "The central story is not that your natal design changes. It is that a temporary life-cycle configuration meets the design that has accompanied you throughout life.",
                    f'Your exact Uranus opposition passes extend from {passes[0]["timestamp_local"][:10]} through {passes[-1]["timestamp_local"][:10]}. The selected reference pass is the moment used for the cycle chart in this reading.',
                ],
                "pull_quote": "A turning point does not erase the road behind you.",
                "how_to_read_heading": "How to read this report",
                "how_to_read": "The natal foundation describes the design you were born with. The cycle chart describes the temporary configuration at the selected exact opposition pass. The combined field describes how those two layers meet; it is not a permanent redesign.",
                "layers": {
                    "natal": {
                        "headline": f'{natal.get("type", "")} · {natal.get("authority", "")}',
                        "subline": f'{natal.get("profile", "")} · {natal.get("definition", {}).get("type", "")}',
                    },
                    "cycle": {
                        "headline": f'{cycle.get("type", "")} · {cycle.get("authority", "")}',
                        "subline": f'{cycle.get("profile", "")} · {cycle.get("definition", {}).get("type", "")}',
                    },
                    "combined": {
                        "headline": "Temporary combined field",
                        "subline": "Context, not redesign",
                    },
                },
            },
            "chapters": chapters,
        }
        with tempfile.TemporaryDirectory(prefix="ky-uranus-") as folder:
            target = Path(folder) / "uranus-opposition.pdf"
            render_uranus_opposition_pdf(report_data, target)
            payload = target.read_bytes()
    except (UranusReportEvidenceError, ValueError, KeyError, TypeError) as exc:
        return _reply(handler, 422, {"error": "uranus_report_invalid", "detail": str(exc)})
    except Exception:
        return _reply(handler, 503, {"error": "uranus_report_pdf_unavailable"})

    name = re.sub(r"[^A-Za-z0-9_-]+", "-", str(body.get("client_name") or "personal")).strip("-")[:48] or "personal"
    handler.send_response(200)
    handler.send_header("Content-Type", "application/pdf")
    handler.send_header("Content-Disposition", f'attachment; filename="Uranus-Opposition-{name}.pdf"')
    handler.send_header("Content-Length", str(len(payload)))
    handler.send_header("Cache-Control", "private, no-store")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.end_headers()
    handler.wfile.write(payload)


