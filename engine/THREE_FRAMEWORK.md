# 3framework — Canonical Evidence + Adaptive Context + ChatGPT

## Purpose
3framework is the deliberately simplified answering architecture for Know Yourself:

1. **Canonical Chart + Evidence** — authoritative deterministic chart mechanics and source-linked interpretive evidence.
2. **Adaptive User Context** — the current request, explicit preferences, confirmed corrections, consented user context and bounded conversation continuity.
3. **ChatGPT** — directly synthesizes the first two layers into a natural answer. There is no separate interpretation model or mandatory AI critic in this path.

The existing 5framework remains available for comparison. Do not silently treat 3framework as 5framework or route a 3framework answer through the separate critic as if it were part of this design.

## Invariants
- Layer 1 is authoritative for natal mechanics, activations, lines, channels, centres, type, strategy, authority, profile and temporal claims.
- A gate catalogue or channel catalogue describes possible Human Design concepts; it does not establish that a gate/channel is activated in a particular chart.
- Chart-specific claims must be checked against the supplied canonical evidence before interpretation. Natal activations must be distinguished from transits.
- Layer 2 may shape relevance, tone, depth and continuity. It may not overwrite Layer 1, change evidence standards or increase certainty.
- Conversation history and prior assistant answers are context, never chart evidence.
- Source-linked knowledge may explain meanings, but interpretation must remain distinguishable from mechanics.
- If required evidence is missing, say which specific fact cannot be verified; never guess.
- Exact gate-line meanings require exact gate-line evidence. Do not append generic line keywords to a gate and present the result as a verified synthesis.
- Current transit statements require supplied temporal evidence. Never claim a full transit overlay was checked unless it was.

## Canonical gate verification
The `verifyCanonicalGate` function reads only the canonical `E-ACTIVATIONS` and `E-GATES` evidence records. It reports whether the gate is present in natal activations, the matching body/imprint/line records, and whether evidence is missing. A gate catalogue entry alone cannot mark a gate as activated.

## Layer 2 context
The direct ChatGPT input keeps separate fields for:
- filtered adaptive response policy;
- governed, consented active user memory;
- bounded conversation context;
- chart/evidence/knowledge packets.

The context fields are intentionally not merged into canonical evidence.

## Status boundary
This implements the 3framework contract and direct-model input envelope in the repository. It does not by itself connect an external ChatGPT/OpenAI model provider or prove model behaviour; provider integration and live acceptance tests remain separate work. The current repository's provider boundary is provider-neutral.

## Acceptance tests
- Gate 7 and Gate 31 are not marked natal activations in the current golden chart.
- Gate 57 is verified from canonical activations with its natal body/line context.
- A catalogue entry for channel 7–31 does not mark that channel as defined.
- Missing canonical activation evidence returns `unknown`, not `absent`.
- Adaptive context cannot override chart evidence.
