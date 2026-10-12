# Basic Allowlist / Premium-by-Default Policy

**Status: proposed implementation contract; not yet enforced in production.**

## Canonical rule

Know Yourself uses an explicit Basic allowlist. Basic is the only tier that may proceed without a server-verified Premium entitlement. Every capability that is not explicitly classified and implemented as Basic is Premium by default. Unknown, missing, malformed, or newly introduced capabilities must never silently inherit Basic access.

This replaces a growing Premium feature denylist with a small Basic allowlist. It does not mean every Premium feature needs a separate bespoke guard: the shared server policy decides access, while each route declares the capability it requires.

## Basic allowlist (initial scope)

1. Deterministic natal chart facts and mechanics: activations, gates/lines, centres, channels, type, strategy, authority and profile, subject to canonical-chart validation.
2. Basic chart overview using approved foundational L1 knowledge only.
3. Basic transit overlay facts: temporary activations and natal-versus-transit distinction, without detailed personalized life-cycle or advanced transit synthesis.
4. Account/chart navigation and permitted chart-library operations that do not expose restricted interpretation or another user's data.

Only capabilities explicitly named in the server-owned allowlist are Basic. This list is intentionally small and must be reviewed when new functionality is added.

## Premium by default

Examples include detailed PHS interpretation; detailed Solar Return, Saturn Return, Uranus opposition, Chiron Return and node-cycle readings; advanced transit analysis; personalized synthesis beyond the approved Basic overview; advanced source retrieval and validated knowledge-relationship traversal; insight history/pattern recognition; two-chart comparison and relationship analysis; and any unclassified future capability.

The examples clarify scope but are not the enforcement mechanism. The allowlist and route policy are.

## Enforcement requirements

- Resolve the requested capability from the server route/operation, not a client-supplied tier claim or capability label alone.
- Authenticate the user and resolve Premium entitlement server-side.
- Authorize before restricted evidence retrieval, chart/transit computation when that computation is part of a protected operation, or model invocation.
- A Free request must not gain deeper interpretation by relabelling an open-ended question as `guide.basic`.
- If the server cannot determine that an operation is explicitly Basic, require Premium or return a safe basic fallback. Entitlement service failures fail closed for protected operations.
- Do not send restricted source records, advanced relationships, or Premium-only personal context to the model for a Free request.
- Prefer a useful, deterministic Basic answer plus a clear upgrade message over a dead-end error where the requested basic facts are available.

## Required regression tests

1. Explicitly allow each approved Basic operation for a Free user.
2. Deny an unknown/new capability by default; it must not inherit Basic access.
3. Open-ended questions default to Premium regardless of a client-supplied `plan`, `tier`, or `capability` field.
4. Saturn Return and Uranus opposition: basic timing/mechanics only where approved; detailed personalized interpretation is Premium.
5. Follow-up prompts such as “what is it saying?”, “tell me more”, and “make it personal” cannot bypass the boundary after a Basic answer.
6. Free denial happens before restricted retrieval and before model invocation; assert both were not called.
7. Valid Premium users receive the detailed response; Free users receive only permitted Basic output and a useful upgrade path.
8. Missing, expired, mismatched, or unavailable entitlement never grants Premium.
9. A new feature with no explicit Basic allowlist entry is Premium by default.
10. Test the actual selected API route and authenticated application; unit tests alone do not prove production enforcement.

## Release gate

Do not mark this policy complete until the candidate route implements server-derived capability classification, all regression tests pass on the exact head, the app/API deployment path is selected, entitlement provisioning is operational, and authenticated end-to-end tests prove both Basic access and Premium denial/allow behavior. No deployment is authorized by this document.
