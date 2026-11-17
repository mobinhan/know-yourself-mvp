# Know Yourself — Life Purpose & Direction Report Specification
Version: 1.0
Status: Proposed finalized content contract for pilot validation
Product key: `life-purpose-direction`
Product version: 1

## Product promise

A substantial, personalized Human Design report that helps a reader explore recurring themes, decision-making, and possible direction through their verified chart. It offers a framework for reflection—not a fixed destiny, prediction, diagnosis, or instruction to make a particular life choice.

This is the first paid flagship report. It is distinct from the free Basic Report: the Basic Report teaches the reader the essential mechanics of their design; this report integrates the relevant mechanics into a deeper purpose-and-direction narrative. It must not be a disguised career report or relationship report, because those are separate future catalogue products.

## Non-negotiable 3Framework rules

1. **Canonical Chart + Immutable Evidence:** deterministic chart mechanics and source-linked, approved Human Design knowledge are authoritative. The model may not calculate, repair, or invent chart facts.
2. **Adaptive User Context:** use only relevant, permitted context supplied under the existing consent rules. Context can shape relevance, not change chart facts. If no personal context is available, do not fabricate biography or past experiences.
3. **Direct ChatGPT synthesis:** synthesize the canonical facts, approved evidence, and permitted context directly. Normal structured-output validation and evidence-ID filtering are allowed. No separate critic, answer critic, or fourth reasoning layer is added.

The report assembly, validation, online reader, and PDF renderer are delivery infrastructure—not a new reasoning layer.

## Intended reader outcome

After reading, the person should be able to:
- describe the verified foundations of their design in understandable language;
- recognize two to four integrated themes grounded in their chart and evidence;
- use their own Strategy and Authority as a reflective decision-making experiment, without treating Human Design as a guarantee;
- distinguish a possible conditioning pattern from an established personal fact;
- identify practical questions and small experiments for the next few weeks.

## Required chapters

### 1. Orientation — A Map, Not a Verdict
Set expectations and explain what this report can and cannot establish. State the chart reference and version. Frame purpose as something to explore through lived experience, not a fixed prediction.

### 2. The Foundations of Your Design
Present verified Type, Strategy, Authority, Profile, Definition, and relevant defined/open centres. Explain only what is supported by canonical chart data and approved knowledge. Do not repeat the Basic Report as a list; use this chapter to establish the mechanics needed for the deeper synthesis.

### 3. Your Life Theme
Interpret the Incarnation Cross and its relevant conscious/unconscious Sun/Earth activations only when those fields are present in canonical output and supported by approved evidence. Distinguish the mechanical gate/line facts from their interpretive meaning. If the cross or supporting evidence is incomplete, disclose the limitation and do not improvise.

### 4. The Themes That Connect Your Design
Synthesize two to four overarching themes from the person's actual completed channels, relevant gates, Profile, Definition, and Life Theme. Do not produce a catalogue of isolated channel descriptions. Each theme must reference the evidence that supports it and explain how the components connect. No channel or gate may be described as natal unless it is in the canonical chart.

### 5. Finding Direction Through Your Decision-Making Mechanics
Translate the verified Strategy and Authority into a practical self-observation process. Explain the person's specific mechanics accurately; do not flatten every Authority into a Sacral response. Offer questions and experiments, not commands. Do not tell the reader what job to take, predict career success, or replace their judgment.

### 6. Friction, Conditioning, and What to Observe
Use only centres confirmed open/undefined in the canonical chart. Describe relevant traditional Human Design conditioning themes as possibilities, not facts about the reader. Separate natal definition from temporary transit activations. Do not infer trauma, mental-health conditions, or personal history.

### 7. Timing and Life Cycles (Conditional Chapter)
Include only if the relevant cycle calculations, dates, and approved interpretive evidence are available and validated. Distinguish calculated timing from interpretation, and distinguish life-cycle overlays from natal chart mechanics. If the data is unavailable, omit the chapter or return a clear, non-user-facing omission reason; never fill gaps with approximate invented dates.

### 8. Integration — A Directional Practice
Give a short, practical integration plan with reflection questions and small experiments. Connect the exercises to the report's actual themes and decision-making mechanics. Do not present the plan as a prescription or guaranteed outcome.

## Structured output contract

The model-generated content is limited to:
- `sections[]`: stable `section_id`, human-readable `title`, ordered `blocks[]`;
- `interpretation_kind[]`: values from `chart_mechanics`, `source_grounded_teaching`, `reflective_synthesis`;
- `reflection_prompts[]`: questions or experiments framed as reflection.

Allowed block types are `paragraph`, `bullet_list`, and `callout`. Every block carries `evidence_ids[]` containing only IDs from the exact evidence bundle supplied to synthesis. Chart snapshot, evidence manifest, report ID, product/version, timestamps, and generation metadata are server-owned and must never be accepted from model output.

The final persisted envelope must use the existing `api/report_contracts.py` contract. Do not create a second competing JSON schema. Any chart facts in text are checked against canonical chart data; evidence IDs are allow-listed against the supplied evidence. Any `validation_warnings` block acceptance until each warning is corrected or consciously waived by a human reviewer.

## Presentation and delivery

- Use the same validated content envelope for the online reader and downloadable PDF.
- Editorial visual direction: warm cream/white, deep navy/indigo typography, restrained blue/gray chart fills, generous whitespace, readable hierarchy, restrained dividers.
- Render the actual bodygraph from canonical structured chart data. Never use an AI-generated bodygraph image or substitute decorative artwork for the chart.
- Render all chart labels, defined/open states, and annotations deterministically. Provide a legend.
- PDF and online reader must preserve chapter order, text, callouts, reflection prompts, and chart provenance. Minor layout differences are acceptable; content divergence is not.
- Include report version, chart fingerprint, generation timestamp, and evidence/provenance metadata in a compact end matter or report metadata view.

## Explicit exclusions for v1

- No separate career, money, or relationship analysis; those are distinct future report products.
- No predictions or deterministic life outcomes.
- No new critic/reasoning layer.
- No payment-provider selection, live pricing, checkout, or paid availability until provider eligibility, pricing, ownership, and artifact-access controls have been reviewed.
- No production migration, merge, or deployment as part of specification finalization.

## Pilot acceptance criteria

1. A real chart produced by the canonical engine supplies the trusted chart snapshot and fingerprint.
2. The report has all required chapters supported by available canonical facts and evidence; conditional timing is omitted if not verifiable.
3. All referenced evidence IDs are from the supplied bundle.
4. Chart mechanics, channel/gate references, and open/defined centre claims match canonical data.
5. No fabricated personal history or unsupported certainty.
6. Any validation warning is resolved or explicitly waived by a human reviewer.
7. The validated envelope is persisted under authenticated ownership.
8. The online reader loads the persisted report and renders the true bodygraph.
9. The PDF is generated from that same persisted envelope, is readable and branded, and can be retrieved only by the authorized owner.
10. The pilot record includes the exact commit, test output, chart fingerprint (not birth details), report version, PDF checksum, and the online/PDF comparison result.

A mock or fixture test can validate plumbing, but it does not satisfy the real-chart pilot criterion.
