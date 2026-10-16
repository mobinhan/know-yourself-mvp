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
    status = decision.get("status")
    if status == "authentication_required":
        return 401, {"error": "authentication_required"}
    if status == "premium_required":
        return 403, {"error": "premium_required", "capability": decision.get("capability")}
    return 503, {"error": "entitlement_unavailable", "capability": decision.get("capability")}


# ------------------------------------------------------------- templates --

REPORT_TEMPLATES = {
    "basic": {
        "title": "Basic Report",
        "excerpted": set(),
        "sections": [
            ("overview", "Your Design at a Glance",
             "Write the opening overview of this person's Human Design report: the essence of their design as one coherent narrative - type, strategy, authority, profile and definition woven together, no lists."),
            ("type_strategy", "Type & Strategy",
             "Write the Type & Strategy section of this Human Design report: how this design is built to engage with the world, their decision-making strategy in daily life, and the core deconditioning theme for this type."),
            ("authority", "Your Inner Authority",
             "Write the Inner Authority section: how this person's authority speaks, how they can practice trusting it in real decisions, and what it feels like when they override it."),
            ("profile", "Your Profile",
             "Write the Profile section: their profile lines as a life role, how they naturally learn and mature, and how others tend to experience them."),
            ("centres", "Centres: Consistent vs. Conditioned",
             "Write the Centres section: walk through their DEFINED centres as sources of reliable energy, and their UNDEFINED centres as places where they take in and amplify others - with the key conditioning theme for each open centre."),
            ("channels", "Your Defined Channels",
             "Write the Channels section: for each of their completed channels, the fixed gift it carries and how it shows up in their life - mechanic-grounded, specific to their chart."),
        ],
    },
    "preview": {
        "title": "Complete Report - Preview",
        "excerpted": {"profile", "channels", "incarnation_cross", "gates", "life_cycles"},
        "sections": [
            ("overview", "Your Design at a Glance",
             "Write the opening overview of this person's Human Design report: the essence of their design as one coherent narrative - type, strategy, authority, profile and definition woven together, no lists."),
            ("type_strategy", "Type & Strategy - In Depth",
             "Write the deep Type & Strategy section of the Complete Report: strategy in career, relationships and rest; the signature of this type when living correctly vs. the not-self theme."),
            ("authority", "Your Inner Authority - In Depth",
             "Write the deep Inner Authority section: the authority's nuance, its relationship to timing, and practices for real decisions."),
            ("profile", "Your Profile & Life Role",
             "Write the deep Profile section of the Complete Report: profile lines, their life role, learning style and maturation path."),
            ("centres", "Centres - Full Conditioning Map",
             "Write the deep Centres section: every centre, defined and undefined, with conditioning wisdom and transpersonal themes."),
            ("channels", "Your Complete Channel Architecture",
             "Write the deep Channels section: every completed channel with its gift, shadow, and integration into the whole design."),
            ("incarnation_cross", "Your Incarnation Cross",
             "Write the Incarnation Cross section: their cross as the life theme - the conscious/unconscious gates and what this life is arranged to explore."),
            ("gates", "Your Key Gates",
             "Write the Key Gates section: their most prominent activated gates (sun/earth and repeated activations), each with its theme in their life."),
            ("life_cycles", "Your Life Cycles",
             "Write the Life Cycles section: the major cycle timings of this design - Saturn return and oppositions, Uranus opposition - and what each cycle asks of them."),
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
        + " Ground everything in the supplied chart mechanics and evidence; be specific to THIS chart, warm and concrete."
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
    return _reply(handler, 201, {"report": inserted[0] if inserted else row})


def handle_list_reports(handler):
    from v1_additions import _service_request, _verify_user_id

    user_id = _verify_user_id(handler.headers)
    if not user_id:
        return _reply(handler, 401, {"error": "authentication_required"})
    rows = _service_request(
        "GET",
        "ky_reports?select=id,user_id,report_type,title,version,is_archived,created_at"
        "&user_id=eq." + user_id + "&is_archived=eq.false&order=created_at.desc&limit=100",
    )
    return _reply(handler, 200, {"reports": rows})


def handle_get_report(handler, report_id):
    from v1_additions import _service_request, _verify_user_id

    user_id = _verify_user_id(handler.headers)
    if not user_id:
        return _reply(handler, 401, {"error": "authentication_required"})
    rows = _service_request(
        "GET",
        "ky_reports?select=*&id=eq." + str(report_id) + "&user_id=eq." + user_id + "&limit=1",
    )
    if not rows:
        return _reply(handler, 404, {"error": "report_not_found"})
    return _reply(handler, 200, {"report": rows[0]})