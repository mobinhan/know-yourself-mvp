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

## Candidate integrations (verified 2026-10-14; re-check before live runs)

1. **OpenAI baseline:** Responses API, current configured default `gpt-5-mini`. The official model page currently marks this model deprecated; do not silently change the baseline during this comparison. Consider a separate follow-up benchmark against `gpt-5.4-mini` after the current baseline is reproducible.
2. **Google candidate:** Gemini API model ID `gemini-3.8-flash`, using `generateContent` and JSON response mode. Official pricing page currently lists introductory paid pricing through December 31, 2026 of $0.75 per million input tokens and $3.75 per million output tokens; listed standard pricing doubles from January 1, 2027. Google’s terms differ by service/tier: the free tier may use submitted data to improve products, while paid-tier terms list this as No. Use a paid account/tier and verify the applicable terms before sending even synthetic evaluation data.
3. **Mistral candidate:** API model ID `mistral-small-2603` (Mistral Small 4), using chat completions with JSON-object mode. Official pricing lists $0.15 per million input tokens and $0.60 per million output tokens for Small 4.

Official references:
- OpenAI model and pricing: https://developers.openai.com/api/docs/models/gpt-5-mini and https://developers.openai.com/api/docs/models/gpt-5.4-mini
- Gemini model and pricing: https://ai.google.dev/gemini-api/docs/latest-model and https://ai.google.dev/gemini-api/docs/pricing
- Mistral Small 4 model and pricing: https://docs.mistral.ai/models/mistral-small-4-0-26-03 and https://docs.mistral.ai/inference/pricing

These are documentation checks, not account-level confirmation. Before live tests, confirm each model is enabled for the actual account/region, check retention/training and data-processing terms, set budget limits, and store credentials only as Render server-side environment secrets. Do not paste keys into GitHub, the app, or this conversation.

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
