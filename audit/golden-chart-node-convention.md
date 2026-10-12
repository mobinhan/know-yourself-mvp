# Golden Chart #2 — Lunar-node convention audit

Date: 2026-10-12  
Scope: isolated audit only; no production calculation change.

## Question

Does public Human Design documentation establish one universal lunar-node convention (true vs mean)?

## Web evidence reviewed

- Jovian Archive describes the chart calculation and the role of the nodes, but the public methodology page reviewed does not specify whether its calculation uses the true or mean node: https://jovianarchive.com/pages/get-your-human-design-chart and https://jovianarchive.com/pages/human-design-dictionary
- Project Me explicitly states that its chart calculation uses Swiss Ephemeris and the true lunar node: https://projectme.ai/human-design/chart/
- YourHumanDesign says it uses Astronomy Engine and the true lunar node: https://yourhumandesign.me/pages/free-human-design-chart
- PRISM explicitly uses the mean node and claims this matches the Jovian Archive lineage: https://prismhd.co/method/engine
- The public OccultAPI Human Design chart documentation exposes a `node_type` option (`mean` or `true`) and mentions Jovian Archive's MMI, but the wording alone does not establish a universal rule: https://occultapi.com/docs/astro/human-design/chart

Conclusion: public sources demonstrate that both conventions are used. They do not, by themselves, settle the canonical convention for Know Yourself. Treat claims about what is “most common” or what Jovian Archive uses as unverified until checked against a direct reference chart or authoritative technical documentation.

## Reproducible Golden Chart #2 comparison

Birth: 1982-04-15 07:38 Baarn, Netherlands (1982-04-15 05:38:00 UTC).  
Design moment from the stored fixture: 1982-01-17 09:06:09.053097 UTC.  
The longitude and gate/line mapping below were computed with Swiss Ephemeris 2.10.03 using `swe.TRUE_NODE` and `swe.MEAN_NODE`, and the repository's 58° Rave Mandala offset and gate order.

| Imprint | Node convention | North Node longitude | North Node gate.line | South Node gate.line |
|---|---|---:|---|---|
| Personality | True | 106.978916086° | 53.2 | 54.2 |
| Personality | Mean | 107.664681968° | 53.3 | 54.3 |
| Design | True | 112.427250626° | 62.2 | 61.2 |
| Design | Mean | 112.317608992° | 62.2 | 61.2 |

The Personality node line changes from line 2 to line 3 under the mean-node convention; the Design node gate/line remains the same in this fixture. This is a real substructure difference, even though it does not alter the listed channel set for this chart.

## Decision

- Keep Swiss Ephemeris available and retain the existing true-node implementation as the current recorded setting, not as a proven universal standard.
- Do not change production calculations, the Golden Chart fixture, or merge an audit PR based on this comparison alone.
- Next acceptance step: compare the complete Golden Chart #2 output against a trusted reference chart generated for the exact same birth details, and record the reference service's actual node activations. If the reference cannot reveal the node convention, record the convention as unresolved rather than infer it.
