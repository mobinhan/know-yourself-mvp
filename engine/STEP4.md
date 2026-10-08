# Step 4 — Evidence & Knowledge Layer

## Status
Controlled knowledge registry and evidence-linked retrieval implemented.

## Boundary
The deterministic engine remains the authority for mechanical chart facts. The knowledge layer supplies approved, provenance-traceable Human Design source knowledge. It does not calculate mechanics and does not produce personalised interpretation.

## Flow
Deterministic mechanics
→ canonical evidence
→ evidence-to-knowledge links
→ provenance-controlled knowledge records
→ interpretation layer (later)

## Source policy
Each knowledge record must identify its source and a human-readable locator. Source text is not copied into the application knowledge registry. Copyrighted sources are represented by short paraphrased claims and provenance metadata.

## Retrieval contract
A retrieval packet contains:
- exact evidence record ID and mechanical claim
- mechanical inputs/result
- calculation provenance
- relevant knowledge claims
- source IDs and locators
- explicit interpretation_allowed: false

The future AI layer may consume this packet, but it must not modify the evidence result or silently replace source provenance.

## Acceptance
Step 4 remains incomplete until:
1. source and knowledge validators pass;
2. evidence-to-knowledge retrieval tests pass;
3. all deterministic and canonical contract tests remain green in CI.

No personalised interpretation is introduced in Step 4.
