# Know Yourself Report Marketplace — v1 Contract

**Status:** Draft implementation contract; first pure validation module and unit tests added, not yet wired into API or persistence.  
**Scope:** One flagship paid report, delivered as an interactive online report and downloadable PDF.  
**Product:** life-purpose-direction — “Life Purpose & Direction”.  
**Commercial model:** One-time purchase per report; no subscription dependency.  
**Deployment boundary:** Existing Render API + existing Supabase project. No Vercel. No Lovable changes or credit use without specific approval.

## 1. Architecture invariants — 3Framework

1. **Canonical Chart + Immutable Evidence:** the existing deterministic chart engine and source-linked evidence remain authoritative for chart mechanics. The report service must read the canonical saved chart and its fingerprint/engine version; it must never recalculate chart mechanics in the UI or ask an LLM to invent them.
2. **Adaptive User Context:** optional context is retrieved through the existing consent-aware context rules. It is distinct from chart facts and must not silently overwrite them. A report records which context policy/version was applied.
3. **Direct ChatGPT synthesis:** synthesize from the canonical chart/evidence plus permitted adaptive context. Keep ordinary structured-output validation and evidence-ID filtering. Do not add a separate critic or a fourth reasoning layer to the active 3Framework path.

Report catalog, checkout, purchase entitlement, content persistence and PDF rendering are product services around the framework—not new reasoning layers.

## 2. First-release product contract

| Field | Contract |
|---|---|
| Product key | life-purpose-direction |
| Display name | Life Purpose & Direction |
| Product version | Explicit, immutable version (initially 1) |
| Purchase | One-time; tied to one user, one selected chart and one product version |
| Delivery | Interactive reader and downloadable PDF from the same validated report payload |
| Price/currency | Server-controlled catalogue values; **not set in this milestone** pending payment-provider and pricing review |
| Availability | Hidden/unavailable until content pipeline, payment verification, storage access and end-to-end checks pass |

### Report content envelope

Persist a versioned JSON document. The first version should include:

- schema_version, product_key, product_version, report_id and generated_at.
- chart_snapshot: chart ID, chart fingerprint, deterministic engine name/version and only the chart facts required to interpret the report.
- evidence_manifest: source/evidence IDs and versions actually supplied to synthesis; preserve provenance and any known limitations.
- sections[]: stable section ID, title, ordered blocks and references to evidence IDs.
- interpretation_kind: explicitly distinguish chart mechanics, source-grounded Human Design teaching, and reflective/personal synthesis.
- reflection_prompts[]: optional questions clearly framed as reflection, not factual chart claims.
- generation_metadata: prompt/template version, model/provider identifier, context-policy version and timestamps. Never store API keys or other secrets.

Suggested initial sections: Orientation; Type, Strategy and Authority; Profile; defined/undefined centres; relevant defined channels and selected gates; integrated purpose themes; practical reflection prompts; concise summary. Only include sections supported by available chart facts and approved knowledge records. If required evidence is missing or conflicting, state the limitation rather than filling it with a guess.

## 3. Lifecycle and persistence contract

Use existing ky_charts as the chart source of truth. Do not duplicate chart records or conversation/memory history.

Conceptual records needed when implementation begins (names are provisional and must be reconciled against a fresh schema review before any migration):

- **Report catalogue:** product key/version, display metadata, server-side price/currency, active flag and content-schema version.
- **Purchase:** owner, chart, product/version, provider, provider checkout/payment references, amount in minor units, currency, status, idempotency key, refund/dispute state and timestamps.
- **User report:** owner, purchase reference, chart ID/fingerprint, product version, lifecycle state, validated content JSON, evidence manifest, generation metadata, failure code and timestamps.
- **Report artifact:** report/version, private storage object key, content type, byte size, checksum and creation metadata.
- **Payment event ledger:** provider event ID, event type, processing result and timestamps, with unique event-ID protection against duplicate webhook processing.

Do not create these tables by assumption. Reuse existing concepts where suitable and add only the minimum missing schema after the current database’s actual structure, constraints, policies and migrations are reconciled. The current live schema inspection found no report-marketplace tables, no ky_entitlements table despite the API entitlement code referencing it, and no Storage buckets. Resolve that discrepancy deliberately before depending on entitlement/storage behavior.

### Report states

awaiting_payment → paid → queued → generating → validating → ready

Failure states: payment_failed, generation_failed and validation_failed. A retry must be explicit, bounded and auditable. A report must never be marked ready until schema validation and evidence-reference filtering succeed and the validated content is persisted. Payment confirmation and report generation are separate state transitions.

## 4. Proposed API boundary (not implemented in this milestone)

- GET /v1/report-products — list published product metadata and server-defined prices.
- POST /v1/report-purchases — authenticated owner + chart check; create a provider checkout session using a server-side product price.
- POST /v1/payments/{provider}/webhook — provider-specific signature verification, durable event deduplication and idempotent payment-state update.
- GET /v1/reports — list only the authenticated user’s reports.
- GET /v1/reports/{report_id} — retrieve an owned, ready report for the interactive reader.
- POST /v1/reports/{report_id}/pdf-link — after owner/purchase/report-state checks, issue a short-lived authorized download URL.

Exact route naming can be aligned with existing API conventions before implementation. The browser must not be able to set purchase status, price, ownership, entitlement, report readiness or storage object paths.

## 5. Security, payment and artifact rules

- Verify authenticated user identity and chart ownership server-side before checkout or report creation.
- Verify payment status server-to-server; never trust a browser redirect as proof of payment.
- Verify webhook signatures and deduplicate provider event IDs. Make retries safe and preserve an audit trail.
- Keep the PDF bucket private. Never expose permanent public object URLs; authorize every download and issue short-lived signed URLs only after ownership checks.
- Use the same validated content JSON for the interactive report and PDF. The PDF renderer may change layout, not interpretation or chart facts.
- Keep secrets server-side. Do not log birth data, full report content, access tokens or signed URLs.
- Refunds/reversals must update purchase/access state and be reflected in the audit trail; the precise policy and provider capabilities must be confirmed before launch.

## 6. Payment provider decision gate

No provider is selected yet. Before choosing, compare current support for the merchant’s actual country of registration and settlement bank, customer-facing currencies, fees (including international cards and FX), refund/partial-refund support, signed webhooks, idempotency/retries, dispute handling, settlement timing and integration fit with the existing Python Render API. Confirm the required merchant country and preferred display/settlement currencies before final selection. Do not store card details.

## 7. Acceptance gates before release

1. A chart’s mechanics match the existing deterministic engine output; the report generator cannot mutate canonical chart facts.
2. Every report evidence reference resolves to evidence actually supplied to synthesis; missing/conflicting evidence is disclosed.
3. Ownership denial is tested for checkout, report reads and PDF-link issuance.
4. Browser redirects alone cannot grant paid access; invalid/duplicate webhooks cannot double-charge, double-grant or create duplicate reports.
5. The report is not visible as ready until validated content and metadata are durably persisted.
6. Interactive and PDF outputs derive from the same validated payload; artifact checksum and report version are recorded.
7. Private-storage and signed-link access controls are tested.
8. Mocked end-to-end tests cover payment success/failure/refund, duplicate webhooks, generation/validation failure and retry. Live-provider testing is separately authorized, cost-bounded and reported independently.
9. Keep related pull requests in draft until the full relevant pipeline test exists. Do not merge or deploy marketplace code as part of this documentation milestone.

## 8. Current milestone and next safe action

Implemented on the feature branch:

- `api/report_contracts.py`: pure validation for the Life Purpose & Direction v1 payload, trusted chart ID/fingerprint/engine-version matching, evidence-manifest allow-listing, section/block structure, interpretation labels, timestamps and JSON compatibility.
- `tests/test_report_contracts.py`: unit tests for valid payloads and rejection of chart/evidence tampering, duplicate sections, unknown fields, timezone omissions and malformed output types.

This validator is not yet called by an API route or persistence service. No production database changes, API routes, payment provider, or Render deployment have been made. Automated tests have not yet been executed in this environment; do not treat the presence of tests as proof that they pass.

Next implementation slice: connect the validator to a report-generation service using the existing canonical chart and permitted evidence/context inputs, then add focused mocked tests. In parallel, prepare a reviewable migration proposal only after reconciling the live schema, ownership/RLS policies, server-side Supabase access and private-storage setup. Do not apply DDL to production or deploy until separately approved. Payment-provider research remains deferred until the merchant country/settlement decision is ready.
