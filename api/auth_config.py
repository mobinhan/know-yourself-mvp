"""Public, non-secret configuration for the browser-based KY auth screen."""
from __future__ import annotations

from collections.abc import Mapping


def _enabled(value: object, *, default: bool = False) -> bool:
    if value is None or str(value).strip() == "":
        return default
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def public_auth_config(env: Mapping[str, object]) -> dict:
    """Return only browser-safe Supabase connection settings and feature flags.

    OAuth client IDs/secrets stay in Supabase Auth provider configuration and are
    never read or returned by this endpoint. The browser receives only the
    Supabase URL and publishable/legacy anon key, both intended for public use.
    """
    url = str(env.get("SUPABASE_URL", "") or "").strip().rstrip("/")
    key = str(
        env.get("SUPABASE_PUBLISHABLE_KEY", "")
        or env.get("SUPABASE_ANON_KEY", "")
        or ""
    ).strip()
    configured = bool(url and key)
    provider_flags = {
        "google": "KY_AUTH_GOOGLE_ENABLED",
        "apple": "KY_AUTH_APPLE_ENABLED",
        "facebook": "KY_AUTH_FACEBOOK_ENABLED",
    }
    return {
        "configured": configured,
        "supabaseUrl": url if configured else "",
        "supabaseKey": key if configured else "",
        "emailPasswordEnabled": configured and _enabled(
            env.get("KY_AUTH_EMAIL_PASSWORD_ENABLED"), default=True
        ),
        "providers": {
            provider: configured and _enabled(env.get(flag), default=False)
            for provider, flag in provider_flags.items()
        },
    }
