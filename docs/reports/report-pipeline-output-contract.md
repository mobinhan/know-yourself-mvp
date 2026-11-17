# Know Yourself — Report Pipeline Output Contract
Version: 1.0
Status: Integration contract

## End-to-end stages

1. **Resolve chart:** authenticate the user and verify ownership of the selected `ky_charts` row. Read its canonical chart artifact, fingerprint, engine name, and engine version from the server-side record. Never trust a client-supplied chart snapshot.
2. **Assemble evidence/context:** use the existing evidence selection and consent-aware context policy. Preserve the 3Framework separation. Record the evidence IDs actually supplied for each section and the context-policy version.
3. **Generate section:** call the existing interpretation provider with a section-specific prompt and the trusted foundation/evidence bundle. The provider output is untrusted until normalized and validated.
4. **Validate section:** require a non-empty section answer, validate block types and evidence IDs, and run deterministic chart-mechanics checks. A section with unresolved `validation_warnings` cannot pass acceptance.
5. **Assemble report:** server code combines the ordered sections and attaches the trusted chart snapshot, evidence manifest, report/product IDs, timestamps, and generation metadata using `assemble_report_payload`.
6. **Validate envelope:** run `validate_report_payload` against the server-trusted chart and the exact evidence IDs supplied to synthesis. Reject mismatches; never silently repair canonical chart data.
7. **Persist:** save only validated content. A report must not be marked ready before persistence succeeds. Keep storage failures distinguishable from validation failures.
8. **Render online:** the reader consumes the validated envelope and deterministically renders section order, blocks, reflection prompts, chart graphic, and provenance.
9. **Render PDF:** render the same validated envelope with the same canonical bodygraph. Store the artifact privately, with content type, byte size, checksum, and report/version linkage. A download endpoint must enforce ownership and ready state.
10. **Verify parity:** compare the online report data and PDF text/content against the saved envelope. Record the result.

## Normalized section output

A section response may include the existing provider object (`answer`, `one_line`, `cards`, `factual_basis`, `knowledge_basis`, `relationship_basis`, `limitations`) plus report metadata (`section_id`, `section_title`, `section_index`, `section_count`, `validation_warnings`). This is a generation response, not the final persistence schema.

The assembler maps `answer` and selected card summaries/reflections to ordered `paragraph` and `callout` blocks. The evidence IDs attached to each block must be drawn from that section's actual supplied evidence bundle; never infer evidence IDs from text or let the browser add IDs after generation.

## Failure semantics

- Authentication/ownership failure: deny access without disclosing whether another user's chart/report exists.
- Provider failure: keep the report incomplete; return a safe provider-unavailable error.
- Schema or evidence failure: mark/reject as validation failure; do not persist as ready.
- Unresolved chart warning: reject acceptance until corrected or human-waived.
- Storage/PDF failure: preserve the validated report as not-ready for delivery and return a safe error; do not report a successful download.
- Retry: bounded and idempotent where possible; never create duplicate ready reports or duplicate artifacts on retry.

## Test layers

- Pure contract tests: envelope assembly, schema validation, chart mismatch, evidence mismatch, malformed output, duplicate IDs/sections, and timestamps.
- Pipeline adapter tests: provider output to normalized section blocks, evidence allow-list, stable chapter order, omitted conditional sections, and warning propagation.
- Persistence adapter tests: ownership checks, validated-only writes, safe storage errors, and report versioning.
- Renderer tests: bodygraph comes from canonical structured chart data; online/PDF content parity; private artifact access.
- Pilot: one real chart through generation, validation, persistence, online reader, PDF rendering, and owner-only retrieval. Mocked tests do not replace the pilot.

## Current boundary

This document defines the target output contract. It does not claim that the live API, database, online reader, or PDF renderer currently implements it. The current `ky_reports` table stores generic JSON content and has no dedicated report-artifact table or verified private Storage bucket. Reconcile artifact storage/access before production release. No production schema or Storage changes are authorized by this document.
