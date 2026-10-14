# Know Yourself AI Provider Comparison

Status: preparation milestone; no provider switch and no production deployment.

## Objective

Compare the current OpenAI Responses integration with Google Gemini Flash and Mistral Small 4 behind the existing Render API. Keep the canonical chart engine, evidence retrieval, 3Framework orchestration, Supabase direction, and post-generation validation unchanged.

## Non-negotiable invariants

- Provider calls are server-side only; never expose provider credentials to the browser.
- The canonical chart/evidence payload is the source of chart truth. Models do not calculate or mutate chart mechanics.
- The same selected chart evidence, controlled knowledge, validated relationships, temporal context, and user question are supplied to each candidate.
- Timing tests must include verified temporal evidence; absent temporal evidence must not produce claims about current transits.
- Parse model output as untrusted input and retain existing schema and evidence-ID allow-list validation.
- Provider failures are explicit; never silently substitute fabricated answers.
- Do not log prompts, chart payloads, credentials, or full provider responses.
- Keep provider choice configurable server-side. No automatic production switch.

## Candidate integrations

1. OpenAI Responses API — existing baseline.
2. Gemini API — use a documented Flash model and its structured-output configuration.
3. Mistral API — use a documented Small 4 model and JSON/structured output configuration.

Before live tests, verify exact model IDs, current token pricing, supported output constraints, retention/training terms, and required server secrets from official provider documentation. Never assume a model alias is available in every account or region.

## Benchmark corpus

Run identical prompts and evidence payloads across each provider:
- General overview grounded in the canonical chart.
- Explicit gate/line question where the exact activation exists.
- Gate/line question where the requested activation is absent.
- Channel/centre question grounded in the supplied foundation.
- Timing question with temporal evidence.
- Timing question without temporal evidence.
- Follow-up requiring prior conversation context.
- Personalization case with explicit user preference, clearly separated from chart facts.
- Invalid/malformed JSON and provider-error handling.

Use synthetic or approved test fixtures; do not send real users' private birth data or memories to a candidate provider without confirming the applicable privacy terms.

## Measurements

For every case, record provider/model, success/failure, latency, input/output token counts when available, estimated cost, JSON-contract pass, evidence-ID pass, unsupported-claim violations, and reviewer quality scores for accuracy, relevance, warmth, and usefulness.

A provider passes only if it preserves all safety/evidence invariants, reliably satisfies the output contract, and has acceptable answer quality and cost. Compare quality first, then cost; token price alone is not the decision rule.

## Rollout

1. Implement isolated provider adapters and mocked contract tests.
2. Run local tests without API credentials.
3. Run a small live benchmark only after credentials, billing, privacy and model IDs are verified.
4. Report results and recommendation.
5. Require explicit approval before switching production provider or deploying the change.
