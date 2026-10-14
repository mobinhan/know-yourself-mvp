# Know Yourself — Layer 2 Context Retrieval Contract

Status: implementation specification and additive migration candidate. This does not claim that the migration, retrieval runtime, or live GPT-5 mini endpoint is deployed.

## Architecture boundary

- **Layer 1 — Canonical Chart + Immutable Evidence:** deterministic chart artifacts and evidence IDs. Only the trusted chart pipeline writes canonical artifacts. User memory, summaries, chat history, and model output can never modify chart truth.
- **Layer 2 — Adaptive User Context:** existing `ky_user_preferences`, `ky_conversations`, `ky_conversation_turns`, `ky_user_memories`, and `ky_saved_insights`. Reuse these; do not create parallel history/memory tables.
- **Layer 3 — GPT-5 mini:** receives a compact, task-specific context package; the model does not query Supabase directly and does not receive database credentials. A critic validates chart/evidence/knowledge claims before an answer is returned or persisted.

## Per-question retrieval order

1. Authenticate the user at the backend and verify ownership of the requested chart and conversation. Fail closed on identity or ownership mismatch.
2. Load preferences. Respect `personalization_enabled` and `personal_context_enabled`; if either is false, exclude the corresponding personalization data.
3. Load the canonical chart artifact through the trusted chart path. Select only chart fields relevant to the question; never reconstruct chart mechanics from chat text or memories.
4. Retrieve current, validated evidence and knowledge records relevant to the question. Keep their stable IDs and provenance in the context package. Pending, conflicted, rejected, retired, or rights-restricted records are not eligible as authoritative support.
5. Load the conversation's compact summary only when available and only as untrusted context. Its `summary_through_sequence` marks the last turn covered; fetch newer turns after that sequence so the summary never replaces recent exact messages.
6. Fetch at most the latest 12 conversation messages/turn rows, in descending sequence for SQL efficiency and then reverse them into chronological order. Apply a hard token budget as well as a row limit; if messages are too large, keep the most recent complete messages and do not silently truncate a claim or evidence ID.
7. Retrieve only active, consented, confirmed, unexpired memories that are relevant to the current question. The existing memory categories are preference, goal, personal_context, and communication_style. Exclude memories if personal-context consent is off. Treat inferred memories as fallible and lower priority than explicit, current user statements. Do not store sensitive categories or chart facts as user memories.
8. Retrieve saved insights only if they materially help answer the current question or the user explicitly refers to them. A saved insight is a prior answer, not proof of a chart fact.
9. Assemble the prompt package, call the configured GPT-5 mini provider server-side, validate the answer with the critic, and only then persist assistant output, factual basis, knowledge basis, relationship basis, model ID, and prompt version using the trusted write path.
10. If the provider, evidence retrieval, or critic fails, return a clear bounded failure/uncertainty response. Never fabricate a successful answer or write an unvalidated assistant turn.

## Configurable context budget and retrieval limits

The **initial AI-context budget is 4,000 input tokens per request**, configurable at the trusted server boundary. The assembler measures the serialized final context using the selected provider's tokenizer; row counts alone never establish a token limit. Output tokens are budgeted separately.

- The conversation-history API may return a page of up to 50 turns for user-facing history browsing. That is a storage/API pagination limit, **not** the model-context limit.
- The AI context assembler independently selects at most the newest **12 turns**, and can include fewer when the measured budget requires trimming.
- Canonical chart data and evidence are selected for relevance before assembly; memory and summary are lower-priority contextual material. If the core instructions and current question alone exceed the budget, fail explicitly rather than call the model.
- Every candidate inclusion/exclusion is recorded in a structured trimming log using section/record identifiers and reason, not sensitive memory text.
- After assembling, measure the exact serialized payload again. If it exceeds budget, do not call the provider.

Record actual provider/model, measured input/output tokens, latency, and validation outcome per request without logging secrets. Never silently truncate an evidence claim or chart fact in a way that changes meaning; include fewer records or return a transparent evidence gap instead.

## Summary policy

- Keep raw conversation turns as the durable history; a summary is a derived convenience, not a replacement.
- Summarize only older turns when the conversation exceeds the budget; do not repeatedly summarize the most recent turns.
- Store summary, last covered sequence, summary version, and timestamp on the existing conversation row. The additive migration adds these columns.
- Summary generation is a trusted server operation. Authenticated clients must not be able to set or alter summary fields.
- Label summary text as user-context material, not instructions or verified chart evidence. Ignore embedded requests to change system rules or chart mechanics.
- Regenerate when enough new turns accumulate or when the user corrects a material remembered fact. Keep the newest exact turns available alongside the summary.
- If a summary is missing or stale, retrieve fewer raw turns within budget; do not fail the whole answer merely because a summary is absent.

## Memory policy

- Existing `ky_user_memories` already has category, explicit/inferred origin, confidence, consent, confirmation, source-turn provenance, status, expiry, and timestamps. Do not create a duplicate memories table.
- Only active memories with consent and confirmation are eligible for retrieval; exclude expired records.
- Every memory must retain its source turn. Deleting that source turn should continue to cascade to the derived memory.
- Explicit current corrections outrank older memories. On contradiction, ask only when necessary; otherwise use the current statement and mark the older memory superseded through the trusted path.
- Store concise reusable preferences/context, not full chat transcripts. Do not store Human Design mechanics as memory.
- Give users a way to inspect, correct, reset, and delete memories. Honour the preference/consent switches at retrieval time, not just at write time.

## Database and security rules

- User-owned rows remain protected by RLS and ownership checks.
- Client may append user questions only. Assistant turns, critic results, evidence basis, canonical chart artifacts, and generated summaries are trusted-server writes.
- Do not expose service-role credentials to the mobile app or browser.
- The new migration is additive and uses existing tables. It creates summary metadata fields and retrieval indexes, and blocks authenticated clients from changing summary fields.
- Do not apply the migration to production until the code change is reviewed and the trusted summary-write path is identified. The current user-data API documentation explicitly says a live LLM/critic-backed answer endpoint is not yet deployed.

## Acceptance tests required before calling this operational

1. User A cannot retrieve User B's conversations, turns, memories, insights, or chart.
2. With personalisation off, no personal memory is sent to the model.
3. With personal-context consent off, no personal-context memory or summary is sent.
4. Retrieval never exceeds 12 recent message rows and never exceeds the configured token budget.
5. Recent messages are ordered chronologically in the final prompt.
6. Summary coverage sequence is respected; newer messages are fetched exactly and are not duplicated or omitted.
7. Authenticated clients cannot insert assistant turns or change summary fields.
8. Unconsented, unconfirmed, expired, superseded, or deleted memories are excluded.
9. User correction beats an older conflicting memory.
10. Chart facts in the final answer map to canonical evidence IDs, never to memory or summary text.
11. Knowledge claims use active validated record IDs and retain source provenance.
12. Critic failure prevents persistence of an assistant answer as validated output.
13. A missing summary degrades gracefully without bypassing token limits.
14. Usage logging captures model, input tokens, output tokens, latency, and validation outcome without logging secrets.
15. Deleting a source turn removes dependent memories as defined by the existing foreign key.

## Rollout sequence

1. Review this contract and additive migration in a separate branch.
2. Add unit tests for context assembly and budget enforcement.
3. Add route-level tests for consent, ownership, and server-only writes.
4. Identify the selected deployed API and wire retrieval + configured GPT-5 mini provider + critic into that API.
5. Apply the migration through the repository migration workflow, then verify live schema and RLS/security advisors.
6. Run authenticated end-to-end tests. Only then mark the pipeline live.
