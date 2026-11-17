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


def _structure(activations: dict, channel_catalog: list[dict]) -> dict:
    all_acts = (activations.get("personality") or []) + (activations.get("design") or [])
    gates = {int(a["gate"]) for a in all_acts if isinstance(a.get("gate"), int)}
    channels = _completed_channels(gates, channel_catalog)
    centres = sorted({str(c) for ch in channels for c in ch.get("centres", [])})
    return {
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
        elif c_complete and not n_complete:
            cycle_only.append(record)
        elif (n_complete and bool(gates & cycle_gates)) or (c_complete and bool(gates & natal_gates)):
            electromagnetic.append(record)
        elif gates & natal_gates and gates & cycle_gates:
            compromise.append(record)
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
    reference_pass_index: int = 0,
    age_window: tuple[float, float] = (39.5, 44.5),
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
    cycle_structure = _structure(cycle_activations, channel_catalog)

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

    natal_sun = _activation(foundation, "personality", "sun")
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


def generate_uranus_opposition_chapters(
    foundation: dict,
    evidence: dict,
    *,
    generate_interpretation: Callable,
    knowledge_tier: str = "premium",
) -> list[dict]:
    """Generate all 15 chapters through the active direct-synthesis provider."""
    if evidence.get("evidence_status", {}).get("locked") is not True:
        raise UranusReportEvidenceError("Report evidence packet is not locked.")
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
    chapters = []
    for index, (chapter_id, title, focus) in enumerate(CHAPTERS, 1):
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
        chapters.append({
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
        })
    return chapters
