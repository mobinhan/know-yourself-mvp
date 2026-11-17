# Uranus Opposition Report Pipeline — Replacement Contract

**Status:** replacement implementation in progress  
**Reference artifact:** *The Uranus Opposition — Binh-An Nguyen*, 15 April 1982, Baarn, Netherlands, 07:38 (17-page PDF uploaded 2026-11-17)  
**Scope:** replace the current generic section-by-section report template for Uranus Opposition reports. This is not a cosmetic adjustment.

## 1. Decision

The existing `api/reports.py` generic section pipeline is not the production generator for Uranus Opposition reports. It remains available for other report products until separately replaced. Uranus Opposition reports use a dedicated pipeline with its own evidence assembly, 15-chapter content manifest, release validation, and PDF renderer.

The new pipeline must reproduce the quality, structure, and presentation of the 15 April 1982 master. It must not use the failed 13 December 1980 v2.0 report as its template.

## 2. Non-negotiable architecture

1. **Canonical mechanics remain deterministic.** The existing Swiss Ephemeris / Human Design engine is authoritative for birth activations, cycle activations, channels, centres, definition, type, authority, profile, Cross, and exact transit events.
2. **Three evidence layers remain distinct.**
   - Natal foundation: immutable birth chart.
   - Uranus Opposition cycle: temporary chart calculated at the selected exact opposition pass, including its own Design date.
   - Combined field: chart-to-chart interaction at that reference moment.
3. **3framework remains the active interpretation path.** The provider receives canonical evidence and bounded user context and synthesizes directly. Do not wire a separate critic, critic model, or post-synthesis reasoning layer into the active path.
4. **Interpretation cannot alter mechanics.** Missing evidence must be surfaced as unavailable. It must never be filled by narrative generation.
5. **No old-template fallback.** If required cycle evidence or required report chapters are missing, generation fails closed rather than silently producing a Basic/Preview report.

## 3. Master document architecture

The master is 17 pages: cover, orientation page, and 15 numbered chapters. Each numbered chapter begins on a new page.

| # | Chapter | Required subject |
|---:|---|---|
| 1 | The design beneath your story | Natal foundation; type, strategy, authority, profile, definition, channels |
| 2 | The purpose within limitation | Natal Incarnation Cross and four Sun/Earth activations |
| 3 | The landscape that shaped your perspective | Natal Personality and Design Node axes |
| 4 | The Uranus Opposition: timing and threshold | Natal Uranus position; every exact pass; chosen reference pass and timestamp |
| 5 | The temporary design around the cycle | Cycle chart mechanics; explicit distinction from natal design |
| 6 | The Cross of Penetration: what seeks to come through | Cycle Incarnation Cross and four activations |
| 7 | The new landscape: from the familiar into experience | Cycle Personality and Design Node axes |
| 8 | Two landscapes meeting | Natal-to-cycle Node comparison and synthesis |
| 9 | The long arc of the 5/1 | Natal profile and temporary cycle profile; preserve the distinction |
| 10 | The channels that form your foundation | Natal channels and integrated synthesis |
| 11 | The cycle connections and what they bring into view | Temporary cycle channels and cross-chart electromagnetic/completion connections |
| 12 | Three definitions: natal, cycle and combined | Natal, cycle, and combined definition kept separate |
| 13 | The central movement of this passage | Full synthesis across Crosses, Nodes, profiles, channels and combined field |
| 14 | Bringing the insight into the next chapter | Practical, grounded reflection and experiments |
| 15 | A different relationship with what comes next | Closing synthesis; no prediction or generic filler |

Chapter wording may be adapted to the individual report only when it preserves the chapter's purpose and the master document's voice.

## 4. Required cycle computation

- Read natal Uranus longitude from the canonical natal activation record.
- Search for all exact 180-degree Uranus crossings in the configured Uranus Opposition age window. Preserve direct and retrograde crossings; do not assume there are exactly three.
- Record exact UTC timestamps, local timestamps in the report's stated timezone, crossing direction, and transit longitude.
- Select the reference pass explicitly (default: first exact pass unless the report specification says otherwise).
- Calculate the cycle chart at the reference pass using the same deterministic engine and timezone conversion rules.
- Calculate the cycle Design timestamp from the engine's 88-degree Design Sun rule. Do not approximate it by a nominal number of days.
- Build the combined field from the union of natal and cycle activations, then derive combined channels, centres, and connected components deterministically.
- Calculate chart-to-chart connections from the channel catalogue: cycle-only completions, electromagnetic completions, compromises, and mutual completions must have distinct labels and must not be conflated.
- Never describe cycle authority/profile/definition as replacing the natal authority/profile/definition.

## 5. Content-generation contract

- Generate the 15 chapters against the complete, structured evidence packet. A chapter may be generated as a separate bounded provider call for runtime safety, but all calls must receive the same immutable report-level evidence packet and the relevant chapter focus.
- The prompt must identify the three evidence layers and prohibit natal/cycle/combined conflation.
- Narrative must be personal, detailed, coherent, warm, and storytelling-led. Do not produce encyclopedia definitions, generic horoscope filler, unsupported life predictions, or invented biographical claims.
- Synthesize channels and activations into coherent themes rather than merely listing individual definitions.
- Keep Human Design mechanics explicit where they matter, especially the difference between natal Sacral Authority and a temporary cycle Emotional Solar Plexus definition.
- Use only claims supportable by the evidence packet and supplied knowledge records. If a specific interpretive source is absent, explain the concept only to the level supported by the approved knowledge context.

## 6. PDF presentation contract

Reproduce the observed 1982 master:
- A4 portrait; 17-page target architecture (cover + orientation + 15 chapters).
- DejaVu Sans family; navy `#173A56`, body `#263746`, muted `#66737D`.
- Main chapter titles 20 pt bold; section headings 13 pt bold; body 9.4 pt with approximately 15.2 pt leading; pull quotes 12 pt italic; tables 7.6 pt.
- Main text column begins at approximately 62.7 pt from the left edge.
- Chapter starts are page breaks; footer appears on pages 2–17 with report identity and page number.
- Tables, timeline, and three-layer visual must remain legible and must not truncate meaningful content.

The 17-page count is the reference target, not permission to shrink or truncate content to force pagination. Any content-driven page overflow must be reviewed as a layout regression.

## 7. Release gates

A Uranus Opposition report cannot be released unless all gates pass:

1. Natal foundation matches the canonical chart engine and approved Golden Chart #2 regression.
2. All exact Uranus opposition passes in the selected window are retained and ordered.
3. The reference pass is explicit and cycle activations are computed at that exact timestamp.
4. The cycle Design timestamp is deterministic and reproducible.
5. Natal, cycle, and combined mechanics are separately represented and internally consistent.
6. All chapter IDs 1–15 exist, are in order, and contain substantive content; no placeholder or excerpt-only sections.
7. No unresolved evidence validation warnings; validation is fail-closed for missing or contradictory mechanics.
8. The PDF has the expected cover/orientation/chapter structure, correct fonts/colours, no clipping, no truncated table cells, and no accidental blank pages.
9. The generated PDF is compared against the 1982 master page by page before the replacement is considered production-ready.
10. Tests distinguish mocked provider contract success from live provider quality; do not claim live semantic quality without a real reviewed generation.

## 8. Migration boundary

- Add the dedicated Uranus Opposition pipeline alongside the current generic report code first.
- Wire the Uranus Opposition product route to the dedicated pipeline only after unit and PDF regression tests pass.
- Do not change chart-engine mechanics, the active 3framework boundary, entitlements, payment policy, or other report products as part of this replacement.
- Do not deploy or alter Lovable. Do not use Vercel.
- Do not merge an existing or new PR without explicit user approval.
- Desktop working-tree changes cannot be inspected from this session; preserve them and avoid destructive branch operations.

## 9. Reference report facts to protect during regression

The 1982 reference identifies the natal foundation as Generator, Sacral Authority, 5/1 Profile, Split Definition, with channels 3–60, 11–56, 28–38, 32–54, 34–57, and 42–53. Its first exact Uranus Opposition pass is used as the cycle reference point. The temporary cycle chart is described as an Emotional Generator with 2/4 Profile and Triple Split Definition. The report repeatedly states that temporary cycle mechanics do not replace natal authority or definition.

These are fixture facts for the 15 April 1982 reference chart only. They must not be copied into other clients' reports.
