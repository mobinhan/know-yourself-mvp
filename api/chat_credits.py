"""Server-only chat-credit reservation client for the candidate KY API.

This module intentionally requires a verified Supabase bearer identity and service-role
configuration. It must never be called with a client-supplied user ID or plan.
"""
from __future__ import annotations

import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class ChatCreditError(RuntimeError):
    """Sanitized authentication, accounting, or service failure."""


def _supabase_user(headers, opener=urlopen) -> tuple[str, str, str]:
    authorization = headers.get("Authorization", "")
    if not authorization.startswith("Bearer ") or not authorization[7:].strip():
        raise ChatCreditError("authentication_required")
    base_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    anon_key = os.environ.get("SUPABASE_ANON_KEY", "")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not base_url or not anon_key or not service_key:
        raise ChatCreditError("credit_service_unavailable")
    request = Request(
        f"{base_url}/auth/v1/user",
        headers={"apikey": anon_key, "Authorization": authorization.strip(), "Accept": "application/json"},
    )
    try:
        with opener(request, timeout=5) as response:
            user = json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        if exc.code in (401, 403):
            raise ChatCreditError("authentication_required") from None
        raise ChatCreditError("credit_service_unavailable") from None
    except (URLError, TimeoutError, OSError, ValueError, TypeError, json.JSONDecodeError):
        raise ChatCreditError("credit_service_unavailable") from None
    user_id = user.get("id") if isinstance(user, dict) else None
    if not isinstance(user_id, str) or not user_id:
        raise ChatCreditError("authentication_required")
    return user_id, base_url, service_key


def reserve_chat_credit(headers, request_id: str, capability: str, opener=urlopen) -> dict:
    """Verify user server-side and atomically reserve a credit via service-role RPC."""
    if not isinstance(request_id, str) or len(request_id) > 80:
        raise ChatCreditError("invalid_request_id")
    user_id, base_url, service_key = _supabase_user(headers, opener=opener)
    payload = json.dumps({
        "p_user_id": user_id,
        "p_request_id": request_id,
        "p_capability": capability,
    }).encode("utf-8")
    request = Request(
        f"{base_url}/rest/v1/rpc/reserve_ky_chat_credit",
        data=payload,
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with opener(request, timeout=8) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError:
        raise ChatCreditError("credit_service_unavailable") from None
    except (URLError, TimeoutError, OSError, ValueError, TypeError, json.JSONDecodeError):
        raise ChatCreditError("credit_service_unavailable") from None
    # PostgREST returns a JSON array for a RETURNS TABLE function.
    if isinstance(result, list):
        result = result[0] if result else None
    if not isinstance(result, dict) or not isinstance(result.get("allowed"), bool):
        raise ChatCreditError("credit_service_unavailable")
    return result


def finalize_chat_credit(headers, request_id: str, outcome: str, opener=urlopen) -> dict:
    """Finalize a reserved credit as consumed or voided, idempotently."""
    if outcome not in ("consumed", "voided"):
        raise ChatCreditError("invalid_credit_outcome")
    user_id, base_url, service_key = _supabase_user(headers, opener=opener)
    payload = json.dumps({
        "p_user_id": user_id,
        "p_request_id": request_id,
        "p_outcome": outcome,
    }).encode("utf-8")
    request = Request(
        f"{base_url}/rest/v1/rpc/finalize_ky_chat_credit",
        data=payload,
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with opener(request, timeout=8) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, TypeError, json.JSONDecodeError):
        raise ChatCreditError("credit_service_unavailable") from None
    if isinstance(result, list):
        result = result[0] if result else None
    if not isinstance(result, dict):
        raise ChatCreditError("credit_service_unavailable")
    return result
