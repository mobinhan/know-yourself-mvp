"""Deterministic post-synthesis quality gate for chart-specific interpretation claims.

This is not another language model. It checks high-confidence mechanical claims against
canonical chart data and source-specific gate-line claims against supplied validated evidence.
"""
from __future__ import annotations

import re


_GATE_CLAIM_PATTERNS = (
    re.compile(r"\b(?:your|my|this chart(?:'s)?|natal)\s+gate\s*(\d{1,2})\s+(?:is|was|remains|becomes)\s+(not\s+)?(?:activated|defined|active)\b", re.I),
    re.compile(r"\bgate\s*(\d{1,2})\s+(?:is|was|remains|becomes)\s+(not\s+)?(?:activated|defined|active)\s+(?:in|on)\s+(?:your|my|the)\s+chart\b", re.I),
)
_CHANNEL_CLAIM = re.compile(
    r"\b(?:your|my|this chart(?:'s)?)?\s*channel\s*(\d{1,2})\s*[-–/]\s*(\d{1,2})\s+(?:is|was|remains)\s+(not\s+)?(?:defined|active)\b",
    re.I,
)
_CENTRE_CLAIM = re.compile(
    r"\b(?:your|my|this chart(?:'s)?)?\s*(head|ajna|throat|g|heart|ego|sacral|spleen|solar plexus|root)\s+(?:centre|center)\s+(?:is|remains)\s+(not\s+)?defined\b",
    re.I,
)
_GATE_LINE = re.compile(r"\bgate\s*(\d{1,2})\s*[./-]\s*(\d)\b", re.I)
_GATE_LINE_SYNTHESIS = re.compile(
    r"\b(?:is called|called|known as|means|represents|embodies|is the|is described as)\b",
    re.I,
)
_TRANSIT_ASSERTION = re.compile(
    r"\b(?:today'?s? transit|current transit|currently transiting|transit is activating|transit activates|the transit activates)\b",
    re.I,
)


def _active_gates(foundation: dict) -> set[int]:
    activations = foundation.get("activations", {})
    active = set()
    complete = isinstance(activations, dict) and all(
        isinstance(activations.get(key), list) for key in ("personality", "design")
    )
    for group in ("personality", "design"):
        for item in activations.get(group, []) if isinstance(activations, dict) else []:
            if isinstance(item, dict) and isinstance(item.get("gate"), int) and not isinstance(item.get("gate"), bool):
                active.add(item["gate"])
    core_gates = foundation.get("core", {}).get("gate_set")
    if isinstance(core_gates, list):
        active.update(g for g in core_gates if isinstance(g, int) and not isinstance(g, bool))
        complete = complete and True
    else:
        complete = False
    return active if complete else set()


def _defined_channels(foundation: dict) -> set[str]:
    result = set()
    channels = foundation.get("core", {}).get("channels", [])
    for item in channels if isinstance(channels, list) else []:
        value = item.get("channel") if isinstance(item, dict) else item
        if isinstance(value, str):
            match = re.fullmatch(r"\s*(\d{1,2})\s*[-–/]\s*(\d{1,2})\s*", value)
            if match:
                result.add("-".join(sorted((int(match.group(1)), int(match.group(2)))))
    return result


def _defined_centres(foundation: dict) -> set[str]:
    aliases = {"g": "g", "heart": "heart", "ego": "heart", "solar plexus": "solar plexus"}
    values = foundation.get("core", {}).get("centres", [])
    return {
        aliases.get(value.strip().lower(), value.strip().lower())
        for value in values if isinstance(value, str)
    } if isinstance(values, list) else set()


def review_interpretation(
    answer: str,
    foundation: dict,
    temporal_context: dict | None,
    external_knowledge: list[dict],
    relationships: list[dict],
) -> dict:
    """Return a fail-closed review for explicit, high-confidence unsupported claims."""
    issues: list[str] = []
    active_gates = _active_gates(foundation)
    if active_gates:
        for pattern in _GATE_CLAIM_PATTERNS:
            for match in pattern.finditer(answer):
                gate = int(match.group(1))
                says_not = bool(match.group(2))
                actually_active = gate in active_gates
                if says_not == actually_active:
                    issues.append(f"canonical_gate_status_conflict:gate_{gate}")

    defined_channels = _defined_channels(foundation)
    for match in _CHANNEL_CLAIM.finditer(answer):
        channel = "-".join(sorted((int(match.group(1)), int(match.group(2)))))
        says_not = bool(match.group(3))
        if channel and (says_not == (channel in defined_channels)):
            issues.append(f"canonical_channel_status_conflict:{channel}")

    defined_centres = _defined_centres(foundation)
    for match in _CENTRE_CLAIM.finditer(answer):
        centre = match.group(1).lower()
        if centre == "ego":
            centre = "heart"
        says_not = bool(match.group(1) and match.group(2))
        # Only check centre claims when the supplied centre list is present.
        if defined_centres and (says_not == (centre in defined_centres)):
            issues.append(f"canonical_centre_status_conflict:{centre}")

    # Specific gate-line archetypes need an exact matching source plus a validated edge.
    validated = [edge for edge in relationships if isinstance(edge, dict) and edge.get("status") == "validated"]
    for match in _GATE_LINE.finditer(answer):
        gate, line = int(match.group(1)), int(match.group(2))
        window = answer[match.start():match.start() + 180]
        if not _GATE_LINE_SYNTHESIS.search(window):
            continue
        matching_sources = []
        for source in external_knowledge:
            if not isinstance(source, dict):
                continue
            applies = source.get("applies_when", {})
            source_text = " ".join(str(source.get(key, "")) for key in ("id", "title", "claim", "summary", "concept"))
            source_match = re.search(rf"\bgate\s*{gate}\s*[./-]\s*{line}\b|\b{gate}[.-]{line}\b", source_text, re.I)
            exact_condition = (
                isinstance(applies, dict)
                and applies.get("gate_number") == gate
                and applies.get("line_number") == line
            )
            linked = any(
                source.get("id") in edge.get("external_knowledge_ids", [])
                and isinstance(edge.get("applies_when"), dict)
                and edge["applies_when"].get("gate_number") == gate
                and edge["applies_when"].get("line_number") == line
                for edge in validated
            )
            if source_match and (exact_condition or linked):
                matching_sources.append(source.get("id"))
        if not matching_sources:
            issues.append(f"unsupported_gate_line_synthesis:gate_{gate}_line_{line}")

    if _TRANSIT_ASSERTION.search(answer) and not temporal_context:
        issues.append("transit_claim_without_temporal_evidence")

    # Preserve issue order while avoiding duplicate reports from overlapping patterns.
    issues = list(dict.fromkeys(issues))
    return {"passed": not issues, "issues": issues}
