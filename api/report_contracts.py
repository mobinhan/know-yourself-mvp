"""Strict, provider-independent validation for persisted KY report payloads.

This module is intentionally pure Python: it does not call an LLM, database,
payment provider, or storage service. Trusted chart/evidence metadata is supplied
by the server and must match the generated report before it can be persisted.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Iterable, Mapping


PRODUCT_KEY = "life-purpose-direction"
PRODUCT_VERSION = 1
SCHEMA_VERSION = 1

_ALLOWED_BLOCK_TYPES = {"paragraph", "bullet_list", "callout"}
_REQUIRED_TOP_LEVEL = {
    "schema_version",
    "product_key",
    "product_version",
    "report_id",
    "generated_at",
    "chart_snapshot",
    "evidence_manifest",
    "sections",
    "interpretation_kind",
    "reflection_prompts",
    "generation_metadata",
}


class ReportValidationError(ValueError):
    """Raised when a generated report fails the persistence contract."""


def _require(condition: bool, message: str) -> None:
    if not condition:
        raise ReportValidationError(message)


def _nonempty_string(value: Any, field: str) -> str:
    _require(isinstance(value, str) and bool(value.strip()), f"{field} must be a non-empty string")
    return value.strip()


def _string_list(value: Any, field: str) -> list[str]:
    _require(isinstance(value, list), f"{field} must be a list")
    result = []
    for index, item in enumerate(value):
        result.append(_nonempty_string(item, f"{field}[{index}]"))
    _require(len(result) == len(set(result)), f"{field} must not contain duplicates")
    return result


def _validate_timestamp(value: Any, field: str) -> None:
    text = _nonempty_string(value, field)
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ReportValidationError(f"{field} must be an ISO-8601 timestamp") from exc
    _require(parsed.tzinfo is not None and parsed.utcoffset() is not None,
             f"{field} must include a timezone")


def validate_report_payload(
    payload: Mapping[str, Any],
    *,
    expected_chart: Mapping[str, Any],
    supplied_evidence_ids: Iterable[str],
    allowed_product_key: str = PRODUCT_KEY,
    allowed_product_version: int = PRODUCT_VERSION,
) -> dict:
    """Validate and return a JSON-safe copy of a generated report.

    expected_chart is assembled by trusted server code from the owned canonical
    chart row, never from model output. It must contain chart_id, chart_fingerprint,
    engine_name and engine_version. Evidence IDs must come from the exact evidence
    bundle supplied to synthesis. Extra top-level fields are rejected so accidental
    model/provider output is not silently persisted.
    """
    _require(isinstance(payload, Mapping), "payload must be an object")
    missing = _REQUIRED_TOP_LEVEL - set(payload.keys())
    extra = set(payload.keys()) - _REQUIRED_TOP_LEVEL
    _require(not missing, f"missing required fields: {', '.join(sorted(missing))}")
    _require(not extra, f"unexpected fields: {', '.join(sorted(extra))}")

    _require(type(payload.get("schema_version")) is int and payload.get("schema_version") == SCHEMA_VERSION, "unsupported schema_version")
    _require(payload.get("product_key") == allowed_product_key, "unexpected product_key")
    _require(type(payload.get("product_version")) is int and payload.get("product_version") == allowed_product_version, "unsupported product_version")
    _nonempty_string(payload.get("report_id"), "report_id")
    _validate_timestamp(payload.get("generated_at"), "generated_at")

    chart = payload.get("chart_snapshot")
    _require(isinstance(chart, Mapping), "chart_snapshot must be an object")
    required_chart_keys = {"chart_id", "chart_fingerprint", "engine_name", "engine_version", "canonical_facts"}
    _require(set(chart.keys()) == required_chart_keys, "chart_snapshot has missing or unexpected fields")
    for key in ("chart_id", "chart_fingerprint", "engine_name", "engine_version"):
        expected = _nonempty_string(expected_chart.get(key), f"expected_chart.{key}")
        actual = _nonempty_string(chart.get(key), f"chart_snapshot.{key}")
        _require(actual == expected, f"chart_snapshot.{key} does not match the trusted canonical chart")
    _require(isinstance(chart.get("canonical_facts"), Mapping), "chart_snapshot.canonical_facts must be an object")
    _require(bool(chart.get("canonical_facts")), "chart_snapshot.canonical_facts must not be empty")

    manifest = payload.get("evidence_manifest")
    _require(isinstance(manifest, list), "evidence_manifest must be a list")
    manifest_ids = []
    for index, item in enumerate(manifest):
        _require(isinstance(item, Mapping), f"evidence_manifest[{index}] must be an object")
        _require(set(item.keys()) == {"evidence_id", "source_id", "source_version"},
                 f"evidence_manifest[{index}] has missing or unexpected fields")
        evidence_id = _nonempty_string(item.get("evidence_id"), f"evidence_manifest[{index}].evidence_id")
        _nonempty_string(item.get("source_id"), f"evidence_manifest[{index}].source_id")
        _nonempty_string(item.get("source_version"), f"evidence_manifest[{index}].source_version")
        manifest_ids.append(evidence_id)
    _require(len(manifest_ids) == len(set(manifest_ids)), "evidence_manifest contains duplicate evidence IDs")

    supplied_ids = set(supplied_evidence_ids)
    manifest_set = set(manifest_ids)
    _require(manifest_set.issubset(supplied_ids),
             "evidence_manifest references evidence not supplied to synthesis")

    sections = payload.get("sections")
    _require(isinstance(sections, list) and bool(sections), "sections must be a non-empty list")
    section_ids = set()
    for section_index, section in enumerate(sections):
        prefix = f"sections[{section_index}]"
        _require(isinstance(section, Mapping), f"{prefix} must be an object")
        _require(set(section.keys()) == {"section_id", "title", "blocks"},
                 f"{prefix} has missing or unexpected fields")
        section_id = _nonempty_string(section.get("section_id"), f"{prefix}.section_id")
        _require(section_id not in section_ids, "section_id values must be unique")
        section_ids.add(section_id)
        _nonempty_string(section.get("title"), f"{prefix}.title")
        blocks = section.get("blocks")
        _require(isinstance(blocks, list) and bool(blocks), f"{prefix}.blocks must be a non-empty list")
        for block_index, block in enumerate(blocks):
            bp = f"{prefix}.blocks[{block_index}]"
            _require(isinstance(block, Mapping), f"{bp} must be an object")
            _require(set(block.keys()) == {"type", "text", "evidence_ids"},
                     f"{bp} has missing or unexpected fields")
            block_type = block.get("type")
            _require(isinstance(block_type, str) and block_type in _ALLOWED_BLOCK_TYPES, f"{bp}.type is unsupported")
            if block_type == "bullet_list":
                items = block.get("text")
                _require(isinstance(items, list) and bool(items), f"{bp}.text must be a non-empty list for bullet_list")
                for item_index, item in enumerate(items):
                    _nonempty_string(item, f"{bp}.text[{item_index}]")
            else:
                _nonempty_string(block.get("text"), f"{bp}.text")
            refs = _string_list(block.get("evidence_ids"), f"{bp}.evidence_ids")
            _require(set(refs).issubset(manifest_set),
                     f"{bp}.evidence_ids references evidence absent from evidence_manifest")
            _require(set(refs).issubset(supplied_ids),
                     f"{bp}.evidence_ids references evidence not supplied to synthesis")

    interpretation_kind = payload.get("interpretation_kind")
    _require(isinstance(interpretation_kind, list) and bool(interpretation_kind),
             "interpretation_kind must be a non-empty list")
    _require(all(isinstance(item, str) for item in interpretation_kind),
             "interpretation_kind values must be strings")
    _require(len(interpretation_kind) == len(set(interpretation_kind)),
             "interpretation_kind must not contain duplicates")
    _require(set(interpretation_kind).issubset({"chart_mechanics", "source_grounded_teaching", "reflective_synthesis"}),
             "interpretation_kind contains an unsupported value")

    prompts = payload.get("reflection_prompts")
    _require(isinstance(prompts, list), "reflection_prompts must be a list")
    for index, prompt in enumerate(prompts):
        _nonempty_string(prompt, f"reflection_prompts[{index}]")

    metadata = payload.get("generation_metadata")
    _require(isinstance(metadata, Mapping), "generation_metadata must be an object")
    metadata_keys = {"prompt_version", "model_provider", "context_policy_version", "generated_at"}
    _require(set(metadata.keys()) == metadata_keys,
             "generation_metadata has missing or unexpected fields")
    for key in ("prompt_version", "model_provider", "context_policy_version"):
        _nonempty_string(metadata.get(key), f"generation_metadata.{key}")
    _validate_timestamp(metadata.get("generated_at"), "generation_metadata.generated_at")

    # Return a plain JSON-compatible copy; callers persist only after this succeeds.
    import json
    try:
        return json.loads(json.dumps(payload, ensure_ascii=False, allow_nan=False))
    except (TypeError, ValueError) as exc:
        raise ReportValidationError("payload must contain only JSON-compatible values") from exc
