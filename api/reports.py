"""KY report pipeline: report-first product.

A report is an ordered manifest of sections. Each section is one call to the
existing interpretation provider with a section-specific focus, so all
evidence grounding, tier routing and provider plumbing are reused unchanged.
Generation is chunked per section because Render free tier kills long
requests (~100s) - the client streams sections sequentially.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

_DEPS: dict = {}


def configure(build_foundation=None, send_json=None) -> None:
    if build_foundation is not None:
        _DEPS["build_foundation"] = build_foundation
    if send_json is not None:
        _DEPS["send_json"] = send_json


def _build_foundation(birth: dict, chart_id: str | None = None) -> dict:
    fn = _DEPS["build_foundation"]
    return fn(birth) if chart_id is None else fn(birth, chart_id=chart_id)


def _reply(handler, status: int, payload: dict):
    sender = _DEPS.get("send_json")
    if sender is not None:
        return sender(handler, status, payload)
    return handler._send(status, payload)


def _storage_unavailable(handler, exc):
    detail = "storage upstream unreachable"
    if isinstance(exc, HTTPError):
        detail = f"storage upstream returned HTTP {exc.code}"
    return _reply(handler, 502, {"error": "storage_unavailable", "detail": detail})


def _read_body(handler) -> dict:
    try:
        length = int(handler.headers.get("Content-Length") or 0)
    except (TypeError, ValueError):
        return {}
    if length <= 0 or length > 131072:
        return {}
    try:
        return json.loads(handler.rfile.read(length) or b"{}")
    except Exception:
        return {}


def _public_error(decision: dict):
    status = decision.get("status")
    if status == "authentication_required":
        return 401, {"error": "authentication_required"}
    if status == "premium_required":
        return 403, {"error": "premium_required", "capability": decision.get("capability")}
    return 503, {"error": "entitlement_unavailable", "capability": decision.get("capability")}


# ------------------------------------------------------------- validation --

_ALL_CENTRES = ("head", "ajna", "throat", "g centre", "g center", "identity", "heart", "ego",
                "solar plexus", "sacral", "spleen", "root")


def _validate_section(foundation: dict, interpretation: dict) -> list:
    """Deterministic fact-check of model output against canonical mechanics.

    Every centre mentioned as open/defined, every channel, and every natal
    gate citation must match the engine's chart. Returns human-readable
    warnings; never throws.
    """
    warnings: list = []
    try:
        parts = [interpretation.get("answer") or ""]
        for card in interpretation.get("cards") or []:
            if isinstance(card, dict):
                parts.append(str(card.get("summary") or ""))
                parts.append(str(card.get("reflection") or ""))
        text = " ".join(parts)
        low = text.lower()

        core = foundation.get("core", {}) if isinstance(foundation.get("core"), dict) else {}
        defined = {str(c).lower() for c in core.get("centres", []) if isinstance(c, str)}
        completed_channels = set()
        for ch in core.get("channels", []) or []:
            if isinstance(ch, dict) and isinstance(ch.get("channel"), str):
                completed_channels.add(ch["channel"])
        gate_set = {g for g in core.get("gate_set", []) if isinstance(g, int) and not isinstance(g, bool)}

        for centre in _ALL_CENTRES:
            if centre not in low:
                continue
            canonical = centre.replace(" centre", "").replace(" center", "")
            if canonical == "g":
                canonical = "g"
            actual_defined = canonical in defined or (canonical == "ego" and "heart" in defined) or (canonical == "identity" and "g" in defined)
            open_pat = re.compile(r"(open|undefined|not defined)\s+" + re.escape(centre))
            def_pat = re.compile(r"defined\s+" + re.escape(centre))
            if open_pat.search(low) and actual_defined:
                warnings.append(f"mentions '{centre}' as open/undefined but it is defined in this chart")
            if def_pat.search(low) and not actual_defined:
                warnings.append(f"mentions '{centre}' as defined but it is open in this chart")

        for a, b in re.findall(r"\b(\d{1,2})\s*[-–]\s*(\d{1,2})\b", text):
            name = a + "-" + b
            if name not in completed_channels:
                warnings.append(f"mentions channel {name} which is not a completed natal channel")

        for g in re.findall(r"\bgate\s+(\d{1,2})\b", low):
            if int(g) not in gate_set:
                warnings.append(f"cites gate {g} as natal but it is not activated in this chart")

        if "transit" in low and "natal" in low:
            pass  # presence of both is fine; the provider instructions govern separation
    except Exception as exc:  # validation must never break report delivery
        warnings.append(f"validator_error: {type(exc).__name__}")
    return warnings[:8]


# ------------------------------------------------------------- templates --

REPORT_TEMPLATES = {
    "basic": {
        "title": "Basic Report",
        "excerpted": set(),
        "sections": [
            ("overview", "Your Design at a Glance",
             "Write the opening chapter of this person's Human Design report. Present their Type, Strategy, Authority, "
             "Profile and Definition as one coherent personal narrative - not a list, not a definition dump. "
             "Make the reader feel recognized: this is a map of THEIR design, written for them."),
            ("mechanics", "How Your Design Works",
             "Write the chapter 'How Your Design Works': what is consistently DEFINED in their chart (reliable energy), "
             "what is OPEN (where they take in and amplify the world), and how to begin observing that difference in "
             "daily life. Ground every statement in their actual centres."),
            ("themes", "Your Unique Themes",
             "Write the chapter 'Your Unique Themes': do NOT explain each channel separately. Instead synthesize their "
             "completed channels into 2-3 overarching themes of this design - how the energies combine into one coherent "
             "pattern of gifts and challenges. This synthesis is the heart of the report."),
            ("blind_spots", "Potential Blind Spots",
             "Write the chapter 'Potential Blind Spots' about their OPEN centres: where openness may amplify outside "
             "influence and conditioning. Use reflective questions rather than claiming patterns are already true of the "
             "reader - you do not know their history. Practical, specific to their actual open centres."),
            ("starting_point", "Your Starting Point",
             "Write the closing chapter 'Your Starting Point': 3-5 personalized questions and small experiments that help "
             "them apply this report to real life this week. No pretending to deliver a complete life analysis - an honest, "
             "practical beginning."),
        ],
    },
    "preview": {
        "title": "Complete Report - Preview",
        "excerpted": {"themes", "blind_spots", "incarnation_cross", "gates", "life_cycles"},
        "sections": [
            ("overview", "Your Design at a Glance",
             "Write the opening overview of this person's Human Design report: the essence of their design as one coherent narrative - type, strategy, authority, profile and definition woven together, no lists."),
            ("mechanics", "How Your Design Works - In Depth",
             "Write the deep mechanics chapter: every defined and open centre, the conditioning wisdom for each open centre, and how the definition type shapes their relating."),
            ("themes", "Your Unique Themes - Full Synthesis",
             "Write the deep synthesis chapter: combine ALL completed channels, profile and definition into the overarching themes and life-pattern of this design."),
            ("profile_depth", "Your Profile & Life Role",
             "Write the deep Profile chapter: profile lines, their life role, learning style and maturation path."),
            ("blind_spots", "Potential Blind Spots - Full Map",
             "Write the deep blind-spots chapter: the full conditioning map of every open centre with transpersonal themes and practical deconditioning pointers."),
            ("incarnation_cross", "Your Incarnation Cross",
             "Write the Incarnation Cross chapter: their cross as the life theme - the conscious/unconscious gates and what this life is arranged to explore."),
            ("gates", "Your Key Gates",
             "Write the Key Gates chapter: their most prominent activated gates (sun/earth and repeated activations), each with its theme in their life."),
            ("life_cycles", "Your Life Cycles",
             "Write the Life Cycles chapter: the major cycle timings of this design - Saturn return and oppositions, Uranus opposition - and what each cycle asks of them."),
        ],
    },
}


def handle_report_section(handler, chart_id):
    from entitlements import resolve_request_capability
    from interpretation_provider import InterpretationProviderError, generate_interpretation

    body = _read_body(handler)
    report_type = str(body.get("report_type") or "basic")
    section_id = str(body.get("section_id") or "")
    template = REPORT_TEMPLATES.get(report_type)
    if template is None:
        return _reply(handler, 404, {"error": "unknown_report_type"})
    order = [sid for sid, _title, _focus in template["sections"]]
    if section_id not in order:
        return _reply(handler, 404, {"error": "unknown_section"})

    decision = resolve_request_capability(handler.headers, str(body.get("capability") or "guide.basic"))
    if not decision.get("allowed"):
        status, payload = _public_error(decision)
        return _reply(handler, status, payload)

    try:
        foundation = _build_foundation(body.get("birth") or {}, chart_id=chart_id)
    except ValueError as exc:
        return _reply(handler, 422, {"error": "validation_failed", "detail": str(exc)})

    title, focus = ((t, f) for sid, t, f in template["sections"] if sid == section_id).__next__()
    excerpted = section_id in template["excerpted"]
    question = (
        focus
        + " Ground everything in the supplied chart mechanics and evidence; be specific to THIS chart,"
        + " warm, concrete, and written as a personal analysis the reader recognizes as being about them."
        + " Teach in your own words; never reproduce distinctive source phrasing."
    )
    if excerpted:
        question += (
            " IMPORTANT: this is an excerpt for a free preview - write only a short opening (2-3 sentences)"
            " that conveys the flavour and invites the full version; do not give the full content."
        )

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

    return _reply(handler, 200, {
        "report_type": report_type,
        "report_title": template["title"],
        "section_id": section_id,
        "section_title": title,
        "section_index": order.index(section_id),
        "section_count": len(order),
        "excerpted": excerpted,
        "validation_warnings": _validate_section(foundation, interpretation),
        "content": interpretation,
    })


def dispatch(handler, segments, method: str) -> bool:
    if len(segments) == 4 and segments[:2] == ["v1", "charts"] and method == "POST" and segments[3] == "report-section":
        handle_report_section(handler, segments[2])
        return True
    if segments == ["v1", "reports", "save"] and method == "POST":
        handle_save_report(handler)
        return True
    if segments == ["v1", "reports"] and method == "GET":
        handle_list_reports(handler)
        return True
    if len(segments) == 3 and segments[:2] == ["v1", "reports"] and method == "GET":
        handle_get_report(handler, segments[2])
        return True
    return False


# ---------------------------------------------------- report persistence --


def handle_save_report(handler):
    from v1_additions import _service_request, _verify_user_id

    user_id = _verify_user_id(handler.headers)
    if not user_id:
        return _reply(handler, 401, {"error": "authentication_required"})
    body = _read_body(handler)
    report_type = str(body.get("report_type") or "basic")[:40]
    title = str(body.get("title") or "Report")[:160]
    content = body.get("content")
    if not isinstance(content, dict):
        return _reply(handler, 422, {"error": "validation_failed", "detail": "content must be an object"})

    # Version = previous max + 1 for this user + report_type.
    try:
        prev = _service_request(
            "GET",
            "ky_reports?select=version&user_id=eq." + user_id
            + "&report_type=eq." + report_type
            + "&order=version.desc&limit=1",
        )
        version = (int(prev[0]["version"]) + 1) if prev else 1

        row = {
            "user_id": user_id,
            "report_type": report_type,
            "title": title,
            "version": version,
            "content": content,
            "is_archived": False,
        }
        inserted = _service_request("POST", "ky_reports", row)
    except (HTTPError, URLError, OSError) as exc:
        return _storage_unavailable(handler, exc)
    return _reply(handler, 201, {"report": inserted[0] if inserted else row})


def handle_list_reports(handler):
    from v1_additions import _service_request, _verify_user_id

    user_id = _verify_user_id(handler.headers)
    if not user_id:
        return _reply(handler, 401, {"error": "authentication_required"})
    try:
        rows = _service_request(
            "GET",
            "ky_reports?select=id,user_id,report_type,title,version,is_archived,created_at"
            "&user_id=eq." + user_id + "&is_archived=eq.false&order=created_at.desc&limit=100",
        )
    except (HTTPError, URLError, OSError) as exc:
        return _storage_unavailable(handler, exc)
    return _reply(handler, 200, {"reports": rows})


def handle_get_report(handler, report_id):
    from v1_additions import _service_request, _verify_user_id

    user_id = _verify_user_id(handler.headers)
    if not user_id:
        return _reply(handler, 401, {"error": "authentication_required"})
    try:
        rows = _service_request(
            "GET",
            "ky_reports?select=*&id=eq." + str(report_id) + "&user_id=eq." + user_id + "&limit=1",
        )
    except (HTTPError, URLError, OSError) as exc:
        return _storage_unavailable(handler, exc)
    if not rows:
        return _reply(handler, 404, {"error": "report_not_found"})
    return _reply(handler, 200, {"report": rows[0]})