"""Standalone deterministic Canonical Chart artifact for Know Yourself.

This module has no dependency on the 3framework, user context, or an AI provider.
It is the canonical consumer boundary for natal activations and derived mechanics.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from ephemeris import calculate_chart

ROOT = Path(__file__).resolve().parent
CONTRACT_VERSION = "1.0.0"
ENGINE_NAME = "ky-hd-engine"
ENGINE_VERSION = "1.0.0"
CHANNELS = json.loads((ROOT / "channel-catalog.json").read_text(encoding="utf-8"))["channels"]


def derive_structure(activations: dict) -> dict:
    """Derive chart mechanics solely from canonical activations and catalog."""
    all_activations = activations["personality"] + activations["design"]
    gate_set = sorted({int(a["gate"]) for a in all_activations})
    completed = [
        {"channel": c["channel"], "gates": list(c["gates"]), "centres": list(c["centres"])}
        for c in CHANNELS
        if all(int(g) in gate_set for g in c["gates"])
    ]
    centres = sorted({centre for channel in completed for centre in channel["centres"]})

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
    components.sort(key=lambda component: component[0])
    definition_type = (
        "none" if not components else "single" if len(components) == 1
        else "split" if len(components) == 2 else "triple_split" if len(components) == 3
        else "quadruple_split"
    )

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

    personality = {a["body"]: a for a in activations["personality"]}
    design = {a["body"]: a for a in activations["design"]}
    ps, ds = personality.get("sun", {}), design.get("sun", {})
    cross = {
        "personality_sun": {"gate": ps.get("gate"), "line": ps.get("line")},
        "personality_earth": {"gate": personality.get("earth", {}).get("gate"), "line": personality.get("earth", {}).get("line")},
        "design_sun": {"gate": ds.get("gate"), "line": ds.get("line")},
        "design_earth": {"gate": design.get("earth", {}).get("gate"), "line": design.get("earth", {}).get("line")},
    }
    profile = f'{ps["line"]}/{ds["line"]}' if ps.get("line") and ds.get("line") else None
    return {
        "gate_set": gate_set,
        "channels": completed,
        "centres": centres,
        "definition": {"type": definition_type, "components": components},
        "type": chart_type,
        "strategy": strategy,
        "authority": authority,
        "profile": profile,
        "incarnation_cross": cross,
    }


def calculate_canonical_chart(local_datetime: str, iana_timezone: str) -> dict:
    """Calculate a standalone, versioned chart artifact without AI or user context."""
    raw = calculate_chart(local_datetime, iana_timezone)
    structure = derive_structure(raw["activations"])
    artifact = {
        "contract_version": CONTRACT_VERSION,
        "provenance": {
            "engine_name": ENGINE_NAME,
            "engine_version": ENGINE_VERSION,
            "ephemeris_provider": raw["ephemeris"]["provider"],
            "ephemeris_version": raw["ephemeris"]["version"],
            "timezone": raw["timezone"],
            "design_offset_degrees": raw["ephemeris"]["design_offset_degrees"],
            "node": raw["ephemeris"]["node"],
        },
        "birth_datetime_utc": raw["birth_datetime_utc"],
        "activations": raw["activations"],
        "structure": structure,
    }
    canonical = json.dumps(artifact, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    artifact["canonical_sha256"] = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    return artifact
