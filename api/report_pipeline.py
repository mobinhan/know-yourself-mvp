"""Pure report-pipeline adapter between section generation and the persisted envelope.

This module does not call providers or storage. It normalizes the existing section
response shape, rejects unresolved chart warnings, and delegates final envelope
validation to report_contracts.py. Trusted chart/evidence metadata must be injected
by server-side orchestration, never copied from model output.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Iterable, Mapping, Sequence
import uuid

from report_contracts import (
    PRODUCT_KEY,
    PRODUCT_VERSION,
    ReportValidationError,
    assemble_report_payload,
)

# Required content chapters; life_cycles is conditional and may be omitted when
# validated timing data and approved evidence are unavailable.
LIFE_PURPOSE_SECTION_ORDER = (
    "orientation",
    "foundations",
    "life_theme",
    "integrated_themes",
    "decision_direction",
    "conditioning",
    "life_cycles",
    "integration",
)
OPTIONAL_SECTION_IDS = {"life_cycles"}


def _nonempty(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ReportValidationError(f"{field} must be a non-empty string")
    return value.strip()


def _unique_strings(values: Iterable[Any], field: str) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        if not isinstance(value, str) or not value.strip():
            continue
        value = value.strip()
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result


def _section_to_contract(
    result: Mapping[str, Any],
    *,
    supplied_evidence_ids: set[str],
) -> dict[str, Any]:
    section_id = _nonempty(result.get("section_id"), "section_id")
    title = _nonempty(result.get("section_title"), f"{section_id}.section_title")

    warnings = result.get("validation_warnings") or []
    if not isinstance(warnings, list):
        raise ReportValidationError(f"{section_id} validation_warnings must be a list")
    if warnings:
        raise ReportValidationError(
            f"{section_id} has unresolved validation_warnings; resolve or human-waive before acceptance"
        )

    content = result.get("content")
    if not isinstance(content, Mapping):
        raise ReportValidationError(f"{section_id}.content must be an object")
    answer = _nonempty(content.get("answer"), f"{section_id}.content.answer")

    basis = _unique_strings(
        list(content.get("knowledge_basis") or []) + list(content.get("relationship_basis") or []),
        f"{section_id}.evidence",
    )
    unknown = set(basis) - supplied_evidence_ids
    if unknown:
        raise ReportValidationError(
            f"{section_id} references evidence not supplied to synthesis"
        )

    blocks: list[dict[str, Any]] = [{
        "type": "paragraph",
        "text": answer,
        "evidence_ids": basis,
    }]

    for card in content.get("cards") or []:
        if not isinstance(card, Mapping):
            continue
        summary = card.get("summary")
        reflection = card.get("reflection")
        title_text = card.get("title")
        lines = []
        if isinstance(title_text, str) and title_text.strip():
            lines.append(title_text.strip())
        if isinstance(summary, str) and summary.strip():
            lines.append(summary.strip())
        if isinstance(reflection, str) and reflection.strip():
            lines.append("Reflection: " + reflection.strip())
        if lines:
            blocks.append({
                "type": "callout",
                "text": "\n\n".join(lines),
                "evidence_ids": basis,
            })

    return {"section_id": section_id, "title": title, "blocks": blocks}


def assemble_life_purpose_report(
    section_results: Sequence[Mapping[str, Any]],
    *,
    trusted_chart: Mapping[str, Any],
    evidence_manifest: Sequence[Mapping[str, Any]],
    report_id: str | None = None,
    generated_at: str | None = None,
    prompt_version: str,
    model_provider: str,
    context_policy_version: str,
    supplied_evidence_ids: Iterable[str],
) -> dict[str, Any]:
    """Normalize ordered section responses and validate the final report envelope.

    The caller is responsible for chart ownership verification, loading the chart
    snapshot from the canonical saved chart, and passing the exact evidence bundle
    used for synthesis. This function intentionally has no database/provider I/O.
    """
    if not isinstance(section_results, Sequence) or isinstance(section_results, (str, bytes)):
        raise ReportValidationError("section_results must be an ordered sequence")
    if not section_results:
        raise ReportValidationError("section_results must not be empty")

    supplied = set(_unique_strings(supplied_evidence_ids, "supplied_evidence_ids"))
    manifest_ids = {
        item.get("evidence_id")
        for item in evidence_manifest
        if isinstance(item, Mapping) and isinstance(item.get("evidence_id"), str)
    }
    if not manifest_ids.issubset(supplied):
        raise ReportValidationError("evidence_manifest contains IDs not supplied to synthesis")

    by_id: dict[str, Mapping[str, Any]] = {}
    for result in section_results:
        if not isinstance(result, Mapping):
            raise ReportValidationError("each section result must be an object")
        section_id = _nonempty(result.get("section_id"), "section_id")
        if section_id in by_id:
            raise ReportValidationError(f"duplicate section_id: {section_id}")
        by_id[section_id] = result

    unknown_sections = set(by_id) - set(LIFE_PURPOSE_SECTION_ORDER)
    if unknown_sections:
        raise ReportValidationError("section_results contains unsupported section IDs")

    missing_required = set(LIFE_PURPOSE_SECTION_ORDER) - OPTIONAL_SECTION_IDS - set(by_id)
    if missing_required:
        raise ReportValidationError(
            "missing required sections: " + ", ".join(sorted(missing_required))
        )

    ordered_sections = [
        _section_to_contract(by_id[section_id], supplied_evidence_ids=supplied)
        for section_id in LIFE_PURPOSE_SECTION_ORDER
        if section_id in by_id
    ]

    kinds = ["reflective_synthesis"]
    if any((result.get("content") or {}).get("factual_basis") for result in section_results):
        kinds.insert(0, "chart_mechanics")
    if any((result.get("content") or {}).get("knowledge_basis") for result in section_results):
        kinds.append("source_grounded_teaching")
    kinds = list(dict.fromkeys(kinds))

    prompts: list[str] = []
    for result in section_results:
        content = result.get("content") or {}
        for card in content.get("cards") or []:
            if isinstance(card, Mapping):
                reflection = card.get("reflection")
                if isinstance(reflection, str) and reflection.strip():
                    prompts.append(reflection.strip())

    timestamp = generated_at or datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    return assemble_report_payload(
        {
            "sections": ordered_sections,
            "interpretation_kind": kinds,
            "reflection_prompts": list(dict.fromkeys(prompts)),
        },
        trusted_chart=trusted_chart,
        supplied_evidence=evidence_manifest,
        report_id=report_id or str(uuid.uuid4()),
        generated_at=timestamp,
        generation_metadata={
            "prompt_version": prompt_version,
            "model_provider": model_provider,
            "context_policy_version": context_policy_version,
        },
        allowed_product_key=PRODUCT_KEY,
        allowed_product_version=PRODUCT_VERSION,
    )
