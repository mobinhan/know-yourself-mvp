# Persistent Continuity Retrieval — v1

## Endpoint
Authenticated `GET /functions/v1/user-data-api/continuity` returns a bounded continuity payload for the verified caller. It is additive to the existing profile, preferences, conversations, turns, memories and saved-insights routes.

## Payload
- `schema_version`: stable contract identifier.
- `preferences`: only included when `personalization_enabled` is true.
- `memories`: only active, consented, confirmed, unexpired memories; personal-context and goal records additionally require `personal_context_enabled`.
- `recent_conversations`: up to three active conversations, with at most six most-recent user/assistant turns each, restored to chronological order.
- `saved_insights`: up to five most-recent saved insights, included only when personalization is enabled.
- `boundaries`: explicit statements that deterministic chart mechanics remain authoritative and conversation history is not chart truth.

## Security and behavior
- Identity comes from the validated bearer token; all database queries are scoped to `auth.uid()`'s verified user ID.
- The endpoint uses the existing user-scoped Supabase client and does not use a service-role key.
- No database schema change or new persistent record is introduced by this endpoint.
- Conversation history is available for continuity even when personalization is disabled; saved preferences, memories and saved insights are not injected in that case.
- This v1 retrieval is recency-bounded, not semantic search. A later relevance-ranking layer may select from this bounded candidate set.
- It does not call an LLM, generate answers, write assistant turns, create charts, or alter canonical mechanics.
- User memories remain subject to consent/confirmation and existing inspection/update/delete controls.

## Verification boundary
The pure assembler contract and endpoint source contract are tested in CI. This is not yet a claim of successful authenticated end-to-end testing, production UI integration, or deployment of a new Edge Function version.
