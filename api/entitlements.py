"""Server-side KY capability enforcement for the candidate v1 API.

Premium access is resolved from a server-managed Supabase table after verifying
the bearer token with Supabase Auth. Client tier claims are never consulted.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

CAPABILITIES = {
    "guide.basic": "free",
    "explore.advanced_sources": "premium",
    "transits.advanced_analysis": "premium",
    "lifecycles.full": "premium",
    "insights.history": "premium",
    "insights.pattern_recognition": "premium",
    "connection.comparison": "premium",
}
ACTIVE_STATES = {"active", "trialing"}


def decide_capability(capability: str, user_id: str | None, entitlement: dict | None,
                      now: datetime | None = None) -> dict:
    """Pure policy decision. Authentication and entitlement must be server-verified."""
    if capability not in CAPABILITIES:
        return {"allowed": False, "status": 400, "reason": "unknown_capability"}
    if CAPABILITIES[capability] == "free":
        return {"allowed": True, "status": 200, "reason": "public_basic"}
    if not user_id:
        return {"allowed": False, "status": 401, "reason": "authentication_required"}
    if entitlement is None:
        return {"allowed": False, "status": 503, "reason": "entitlement_unavailable"}
    if entitlement.get("user_id") != user_id:
        return {"allowed": False, "status": 403, "reason": "entitlement_mismatch"}

    now = now or datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    status = entitlement.get("status")
    plan = entitlement.get("plan")
    expires_at = entitlement.get("expires_at")
    grace_until = entitlement.get("grace_until")

    def parse_time(value):
        if not value:
            return None
        try:
            parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
            return parsed.replace(tzinfo=timezone.utc) if parsed.tzinfo is None else parsed
        except (TypeError, ValueError):
            return False

    expiry = parse_time(expires_at)
    grace = parse_time(grace_until)
    if expiry is False or grace is False:
        return {"allowed": False, "status": 503, "reason": "entitlement_unavailable"}
    if expiry is not None and expiry <= now:
        if not (status == "grace" and grace is not None and grace is not False and grace > now):
            return {"allowed": False, "status": 403, "reason": "expired_subscription"}
    if status == "grace" and not (grace is not None and grace is not False and grace > now):
        return {"allowed": False, "status": 403, "reason": "expired_subscription"}
    if status not in ACTIVE_STATES and status != "grace":
        return {"allowed": False, "status": 403, "reason": "inactive_subscription"}
    if plan != "premium":
        return {"allowed": False, "status": 403, "reason": "premium_required"}
    return {"allowed": True, "status": 200, "reason": "active_premium"}


def resolve_request_capability(headers, capability: str, opener=urlopen) -> dict:
    """Verify JWT and load entitlement. Missing row means Free; provider errors fail closed."""
    if capability not in CAPABILITIES:
        return decide_capability(capability, None, None)

    # Basic Guide may use only the provider's explicitly basic knowledge tier.
    if CAPABILITIES[capability] == "free":
        return {**decide_capability(capability, None, None), "knowledge_tier": "basic"}

    authorization = headers.get("Authorization", "")
    if not authorization.startswith("Bearer ") or not authorization[7:].strip():
        return {"allowed": False, "status": 401, "reason": "authentication_required"}

    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    api_key = os.environ.get("SUPABASE_ANON_KEY", "")
    if not base_url or not api_key:
        return {"allowed": False, "status": 503, "reason": "entitlement_unavailable"}

    bearer = authorization.strip()
    try:
        user_req = Request(
            f"{base_url}/auth/v1/user",
            headers={"apikey": api_key, "Authorization": bearer, "Accept": "application/json"},
        )
        with opener(user_req, timeout=5) as response:
            user = json.loads(response.read().decode("utf-8"))
        user_id = user.get("id") if isinstance(user, dict) else None
        if not isinstance(user_id, str) or not user_id:
            return {"allowed": False, "status": 401, "reason": "authentication_required"}

        query = urlencode({
            "select": "user_id,plan,status,expires_at,grace_until",
            "user_id": f"eq.{user_id}",
        })
        entitlement_req = Request(
            f"{base_url}/rest/v1/ky_entitlements?{query}",
            headers={"apikey": api_key, "Authorization": bearer, "Accept": "application/json"},
        )
        with opener(entitlement_req, timeout=5) as response:
            rows = json.loads(response.read().decode("utf-8"))
        if not isinstance(rows, list):
            return {"allowed": False, "status": 503, "reason": "entitlement_unavailable"}
        entitlement = rows[0] if rows else {
            "user_id": user_id, "plan": "free", "status": "active",
            "expires_at": None, "grace_until": None,
        }
        decision = decide_capability(capability, user_id, entitlement)
        if decision["allowed"]:
            decision["knowledge_tier"] = "premium"
        return decision
    except HTTPError as exc:
        if exc.code in (401, 403):
            return {"allowed": False, "status": 401, "reason": "authentication_required"}
        return {"allowed": False, "status": 503, "reason": "entitlement_unavailable"}
    except (URLError, TimeoutError, OSError, ValueError, TypeError, json.JSONDecodeError):
        return {"allowed": False, "status": 503, "reason": "entitlement_unavailable"}
