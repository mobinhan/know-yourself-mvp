# Know Yourself — Basic Report Specification
Version: 1.0
Status: Confirmed product direction; implementation mapping not yet verified
Date: 2026-10-16

## Product principle
Know Yourself is primarily a platform for AI-analysed, personalized reports. Chat is a supporting follow-up experience, not the main product. The Basic Report must feel genuinely useful and personal. "Basic" limits the mechanics and scope of analysis, not the quality of writing or care.

## Basic Report chapters
1. **Your Design at a Glance** — verified Type, Strategy, Authority, Profile and Definition, with the person's actual canonical Human Design bodygraph. Do not render values until verified against canonical chart output.
2. **How Your Design Works** — clear foundational explanation of the person's defined and open/undefined centers and how to begin observing the difference. Include a visual center legend.
3. **Your Unique Themes** — synthesize related defined channels into a small number of coherent themes. Do not simply list six separate channel descriptions. Every channel and gate must be verified against canonical chart data and the controlled knowledge base.
4. **Potential Blind Spots** — explicitly consider the person's open/undefined centers, with careful center-specific conditioning themes and practical self-observation questions. Only mention centers confirmed open in the canonical chart. Do not assert that a possible pattern is necessarily true of the person.
5. **Your Starting Point** — a few useful, personalized reflection prompts or a small exercise that helps the reader begin applying the report. Do not add a separate Career & Life Direction chapter to this Basic Report.

## Visual design
- Premium editorial report, warm cream/white background, deep navy and indigo typography, soft blue/gray chart fills, generous whitespace, restrained dividers and subtle atmospheric cover art.
- The actual bodygraph is a core product visual, not a decorative substitute. Render from canonical chart data; never generate the chart by drawing or image generation.
- Clearly distinguish defined centers/channels from open centers/channels with a consistent legend.
- The cover illustration may be atmospheric and illustrative. Chart mechanics and annotations must be accurate and machine-rendered.
- Design should work on screen and as a downloadable PDF.

## Three-framework production path
1. **Layer 1 — Canonical Chart + Immutable Evidence:** retrieve deterministic chart facts and approved, source-linked Human Design knowledge. The chart engine is the source of truth for mechanics.
2. **Layer 2 — Adaptive User Context:** add relevant user-provided context, consented memories and prior insights where available. A first-time report may have little context; do not fabricate personal history.
3. **Layer 3 — ChatGPT live reasoning/synthesis:** synthesize verified mechanics, approved knowledge and relevant context into coherent themes and careful, useful interpretation.
4. **Report assembly and validation:** validate every chart fact and evidence reference; check center/channel claims against the canonical chart; prevent unsupported personalization; apply report entitlement/content rules; render the real bodygraph; assemble HTML/PDF; persist report content and version.

The report assembly/validation stage is a delivery pipeline, not a new reasoning framework layer. Do not introduce the 5framework as the active architecture.

## Free Basic vs Free Complete Preview vs paid report
- **Basic Report (free, downloadable):** complete foundational experience within the defined scope above.
- **Complete Report Preview (free, downloadable):** demonstrates the richer/full analysis and its quality while intentionally withholding selected sections or detail belonging to the paid product. It must not be merely a longer Basic Report.
- **Full Life Purpose & Direction Report (future paid product):** full, dedicated analysis delivered online and as PDF. Other report types can be added to the catalogue later.
- Do not make the Basic Report feel intentionally broken or empty to push an upgrade. The upgrade is for greater breadth/depth and dedicated topics, not to repair the Basic Report.

## Acceptance criteria
- All Type/Strategy/Authority/Profile/Definition and center/channel values match canonical chart output.
- Natal definition is separate from temporary transit activations.
- Every channel-theme synthesis uses only channels present in the chart and approved knowledge.
- Blind-spot chapter mentions only verified open/undefined centers and frames interpretation as a possible pattern, not a diagnosis or certainty.
- Personal claims use user context or are framed as questions/hypotheses.
- Actual bodygraph is generated from structured chart data, never AI-drawn.
- Basic Report is meaningful and complete within its scope; no separate career/life-direction chapter.
- Output can be rendered online and downloaded as a PDF.
- The saved report records a version and the relevant chart/evidence references for traceability.

## Current status / guardrail
This is a confirmed product/report specification. It does not establish that the current deployed report pipeline already implements every requirement. Implementation and end-to-end validation remain separate milestones. Do not spend Lovable credits, deploy new product code, merge a PR, or use Vercel without explicit permission.
