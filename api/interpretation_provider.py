"""Server-side OpenAI Responses API integration for Know Yourself 3framework.

Only deterministic chart mechanics and selected, source-linked knowledge are sent.
Birth date, birthplace and other direct birth-data fields are deliberately excluded.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
ENGINE = ROOT / "engine"
DEFAULT_MODEL = "gpt-5-mini"
MAX_KNOWLEDGE_RECORDS = 14
MAX_EXTERNAL_RECORDS = 8


class InterpretationProviderError(RuntimeError):
    """Sanitized provider failure; never expose API response bodies to clients."""


def _read_json(name: str) -> dict:
    with (ENGINE / name).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _select_knowledge(question: str, foundation: dict) -> tuple[list[dict], list[dict], list[dict]]:
    records = _read_json("knowledge-records.json").get("records", [])
    external = _read_json("external-knowledge-records.json").get("records", [])
    graph = _read_json("knowledge-relationships.json").get("edges", [])
    q = question.lower()
    terms = set(re.findall(r"[a-z0-9-]+", q))
    gate_match = re.search(r"\bgate\s*(\d{1,2})(?:\s*[./-]\s*(\d))?\b", q)
    gate_number = int(gate_match.group(1)) if gate_match else None
    line_number = int(gate_match.group(2)) if gate_match and gate_match.group(2) else None
    activations = foundation.get("activations", {})
    all_activations = (activations.get("personality") or []) + (activations.get("design") or [])
    active_gate_lines = {(int(a.get("gate", 0)), int(a.get("line", 0))) for a in all_activations}

    scored = []
    for record in records:
        searchable = " ".join([
            str(record.get("concept", "")), str(record.get("claim", "")),
            " ".join(map(str, record.get("related_concepts", [])))
        ]).lower()
        overlap = len(terms.intersection(set(re.findall(r"[a-z0-9-]+", searchable))))
        score = overlap
        if gate_number is not None and "gate" in searchable:
            score += 2
        if any(word in q for word in ("chart", "design", "whole", "overall")) and record.get("id") in {
            "HD-KNOW-FOUNDATION-001", "HD-KNOW-HOLISTIC-001", "HD-KNOW-GATE-001"
        }:
            score += 3
        if score:
            scored.append((score, record))
    selected = [record for _, record in sorted(scored, key=lambda x: x[0], reverse=True)[:MAX_KNOWLEDGE_RECORDS]]

    ranked_external = []
    for index, record in enumerate(external):
        searchable = " ".join([
            str(record.get("title", "")), str(record.get("claim", "")),
            str(record.get("summary", "")), str(record.get("concept", "")),
            str(record.get("source_id", ""))
        ]).lower()
        exact_gate_line = (
            gate_number is not None and line_number is not None
            and gate_number == 57 and line_number == 4
            and (
                re.search(r"\b57[.-]4\b", str(record.get("id", "")).lower()) is not None
                or re.search(r"\bgate\s*57\s*[./-]\s*4\b", searchable) is not None
            )
            and (gate_number, line_number) in active_gate_lines
        )
        overlap = len(terms.intersection(set(re.findall(r"[a-z0-9-]+", searchable))))
        record_id = str(record.get("id", "")).lower()
        record_gate_line_match = re.search(r"\b(?:gate[-_ ]?)?(\d{1,2})[.-](\d)\b", record_id)
        if record_gate_line_match is None:
            record_gate_line_match = re.search(
                r"\bgate\s*(\d{1,2})\s*[./-]\s*(\d)\b", searchable
            )
        record_gate_line = (
            (int(record_gate_line_match.group(1)), int(record_gate_line_match.group(2)))
            if record_gate_line_match else None
        )
        is_gate_line_specific = (
            "gate-line synthesis" in searchable
            or "gate_line_synthesis" in searchable
            or record_gate_line is not None
        )
        # A source-specific gate-line record must never leak into a different
        # explicit gate-line question through generic keyword overlap.
        if (
            is_gate_line_specific
            and gate_number is not None
            and line_number is not None
            and record_gate_line != (gate_number, line_number)
        ):
            continue
        # For a matching source-specific record, require that exact activation
        # in the canonical chart before including it.
        if (
            is_gate_line_specific
            and gate_number is not None
            and line_number is not None
            and record_gate_line == (gate_number, line_number)
            and not exact_gate_line
        ):
            continue
        if exact_gate_line or overlap >= 2:
            # Reserve the limited external-evidence budget for an exact, active
            # gate-line source before generic keyword matches can crowd it out.
            ranked_external.append((1 if exact_gate_line else 0, index, record))
    ranked_external.sort(key=lambda item: (-item[0], item[1]))
    selected_external = [record for _, _, record in ranked_external[:MAX_EXTERNAL_RECORDS]]

    allowed_ids = {record.get("id") for record in selected}
    allowed_external_ids = {record.get("id") for record in selected_external}
    relationships = [
        edge for edge in graph
        if edge.get("status") == "validated"
        and (
            bool(set(edge.get("knowledge_ids", [])) & allowed_ids)
            or bool(set(edge.get("external_knowledge_ids", [])) & allowed_external_ids)
        )
    ]
    if (
        gate_number == 57
        and line_number == 4
        and (gate_number, line_number) in active_gate_lines
        and "EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001" in allowed_external_ids
    ):
        relationships = [
            edge for edge in graph
            if edge.get("id") == "REL-GATE-57-LINE-4-DIRECTOR"
            and edge.get("status") == "validated"
            and "EXT-KNOW-IHDS-GATE-57-4-DIRECTOR-001"
            in set(edge.get("external_knowledge_ids", []))
        ] + relationships
    # Deduplicate by ID while preserving the most specific relationship first.
    deduped = []
    seen = set()
    for edge in relationships:
        if edge.get("id") not in seen:
            seen.add(edge.get("id"))
            deduped.append(edge)
    return selected, selected_external, deduped[:24]


def _response_text(payload: dict) -> str:
    if isinstance(payload.get("output_text"), str) and payload["output_text"].strip():
        return payload["output_text"]
    chunks = []
    for item in payload.get("output", []):
        if item.get("type") != "message":
            continue
        for part in item.get("content", []):
            if part.get("type") == "output_text" and isinstance(part.get("text"), str):
                chunks.append(part["text"])
    return "\n".join(chunks).strip()


def generate_interpretation(question: str, foundation: dict, temporal_context: dict | None = None) -> dict:
    """Generate a grounded 3framework answer, or a truthful non-configured status."""
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        return {
            "interpretation_status": "provider_not_configured",
            "answer": None,
            "factual_basis": [],
            "knowledge_basis": [],
            "relationship_basis": [],
            "limitations": ["OPENAI_API_KEY is not configured in the server environment."]
        }

    model = os.environ.get("OPENAI_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    knowledge, external, relationships = _select_knowledge(question, foundation)
    activations = foundation.get("activations", {})
    def model_safe_activations(items):
        # Exclude ephemeris timestamps and longitudes: neither is needed for interpretation,
        # and timestamps can reveal the user's birth date/time.
        fields = ("body", "imprint", "gate", "line", "colour", "tone", "base")
        return [{key: item.get(key) for key in fields if key in item} for item in items]
    chart_evidence = {
        "core": foundation.get("core", {}),
        "activations": {
            "personality": model_safe_activations(activations.get("personality", [])),
            "design": model_safe_activations(activations.get("design", []))
        },
        "phs": foundation.get("phs", {}),
        "temporal_context": temporal_context,
    }
    user_context = {
        "question": question,
        "chart_evidence": chart_evidence,
        "controlled_knowledge": knowledge,
        "external_knowledge": external,
        "validated_relationships": relationships,
        "framework": "3framework",
        "layer_separation": {
            "layer_1": "Canonical chart mechanics and source-linked knowledge above.",
            "layer_2": "Only the current question and explicitly supplied context; do not infer private user traits.",
            "layer_3": "Synthesize directly into a natural answer. There is no separate critic in this path."
        }
    }
    instructions = (
        "You are the interpretation layer for Know Yourself, a Human Design application. "
        "Follow 3framework: canonical chart evidence first, contextual relevance second, direct synthesis third. "
        "Treat supplied core and activation records as the only authority for this chart's mechanics. "
        "Do not calculate or infer chart mechanics. Never confuse catalogue membership with activation. "
        "Keep natal activations separate from temporary transit activations. If temporal_context is absent, "
        "do not make claims about today's transits. Use controlled knowledge to explain meaning and paraphrase it; "
        "do not quote source material. Preserve source-specific gate-line archetypes only when exact gate and line "
        "evidence and a matching validated relationship are supplied. Never derive a gate-line synthesis by adding "
        "generic line keywords to a gate. Layer 2 can shape relevance and tone but cannot change evidence or certainty. "
        "Distinguish chart mechanics from Human Design interpretation naturally, without repetitive disclaimers. "
        "Do not present Human Design interpretations as scientific diagnosis or guaranteed predictions. "
        "Return one valid JSON object with keys: answer (string), one_line (string), cards (array of objects with "
        "title, summary, reflection, evidence_class, source_ids, gate, channels, centres), factual_basis (array of "
        "evidence labels), knowledge_basis (array of supplied knowledge record IDs), relationship_basis (array of "
        "supplied validated relationship IDs), interpretation (string), limitations (array of strings). "
        "Use concise but substantive prose. Never invent evidence IDs, source IDs, relationship IDs, or facts."
    )
    body = {
        "model": model,
        "instructions": instructions,
        "input": json.dumps(user_context, ensure_ascii=False, separators=(",", ":")),
        "text": {"format": {"type": "json_object"}},
        "max_output_tokens": 1800,
        "store": False,
    }
    request = Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=35) as response:
            provider_payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        # Do not pass provider error details or credentials back to the browser.
        raise InterpretationProviderError(f"OpenAI Responses API returned HTTP {exc.code}") from None
    except (URLError, TimeoutError, OSError) as exc:
        raise InterpretationProviderError("OpenAI Responses API could not be reached") from None
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise InterpretationProviderError("OpenAI Responses API returned invalid JSON") from None

    raw_text = _response_text(provider_payload)
    if not raw_text:
        raise InterpretationProviderError("OpenAI Responses API returned no text output")
    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        raise InterpretationProviderError("Model output did not match the required JSON contract") from None
    if not isinstance(result, dict) or not isinstance(result.get("answer"), str) or not result["answer"].strip():
        raise InterpretationProviderError("Model output is missing the required answer")

    allowed_knowledge = {record.get("id") for record in knowledge}
    allowed_external = {record.get("id") for record in external}
    allowed_relationships = {edge.get("id") for edge in relationships}
    allowed_sources = {
        source_id for record in knowledge for source_id in record.get("source_ids", [])
        if isinstance(source_id, str)
    } | {record.get("source_id") for record in external if isinstance(record.get("source_id"), str)}

    # Treat model output as untrusted input. Invalid optional fields are dropped
    # rather than causing a 500 or leaking malformed structures to the client.
    def string_items(value, allowed=None, limit=8):
        if not isinstance(value, list):
            return []
        return [
            item[:300] for item in value
            if isinstance(item, str) and (allowed is None or item in allowed)
        ][:limit]

    result["factual_basis"] = string_items(
        result.get("factual_basis"),
        {"core", "activations.personality", "activations.design", "phs", "temporal_context"},
    )
    result["knowledge_basis"] = string_items(
        result.get("knowledge_basis"), allowed_knowledge | allowed_external
    )
    result["relationship_basis"] = string_items(
        result.get("relationship_basis"), allowed_relationships
    )
    result["limitations"] = string_items(result.get("limitations"), limit=8)
    raw_cards = result.get("cards") if isinstance(result.get("cards"), list) else []
    allowed_gates = {
        gate for gate in foundation.get("core", {}).get("gate_set", [])
        if isinstance(gate, int) and not isinstance(gate, bool)
    }
    allowed_channels = {
        item.get("channel") for item in foundation.get("core", {}).get("channels", [])
        if isinstance(item, dict) and isinstance(item.get("channel"), str)
    }
    allowed_centres = {
        centre for centre in foundation.get("core", {}).get("centres", [])
        if isinstance(centre, str)
    }
    safe_cards = []
    for card in raw_cards[:6]:
        if not isinstance(card, dict):
            continue
        card_sources = string_items(card.get("source_ids"), allowed_sources, limit=8)
        card_channels = string_items(card.get("channels"), allowed_channels, limit=8)
        card_centres = string_items(card.get("centres"), allowed_centres, limit=9)
        card_gate = card.get("gate")
        if not isinstance(card_gate, int) or isinstance(card_gate, bool) or card_gate not in allowed_gates:
            card_gate = None
        safe_cards.append({
            "title": str(card.get("title") or "A pattern to notice")[:120],
            "summary": str(card.get("summary") or "")[:1200],
            "reflection": str(card.get("reflection") or "")[:800],
            "evidence_class": str(card.get("evidence_class") or "interpretation")[:60],
            "source_ids": card_sources,
            "gate": card_gate,
            "channels": card_channels,
            "centres": card_centres,
        })
    result["cards"] = safe_cards
    one_line = result.get("one_line")
    result["one_line"] = (one_line.strip() if isinstance(one_line, str) and one_line.strip() else result["answer"])[:500]
    result["interpretation"] = result.get("interpretation") if isinstance(result.get("interpretation"), str) else ""
    result["interpretation_status"] = "ready"
    result["model"] = model
    return result
