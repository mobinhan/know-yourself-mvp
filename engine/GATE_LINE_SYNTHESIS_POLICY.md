# Gate–Line Synthesis Policy

## Purpose

Prevent a plausible but unsupported interpretation from being created by combining a general gate description with a general line keyword. A gate–line combination is a specific interpretive claim and requires specific support.

## Required reasoning layers

1. **Gate-level meaning:** use a controlled, source-linked record for the gate's core theme.
2. **General line mechanics:** use a separate record for the line's structural role, where relevant.
3. **Gate–line synthesis:** use a source-linked record specific to the exact gate and line. Do not assume this synthesis is established merely because the gate and line records are individually supported.
4. **Chart context:** verify the exact gate and line from canonical activation evidence when making a claim about the user's chart. If the question explicitly names a gate-line pair, the question can identify the requested concept, but it does not replace evidence for personal chart facts.
5. **Synthesis and expression:** paraphrase the source accurately, preserve named archetypes and source-supported polarity, and make clear when a further connection is an interpretation rather than source teaching.

## Retrieval rule

Gate-line relationships must carry exact applicability conditions, such as `gate_number` and `line_number`. Retrieval must receive verified activation context or an explicit gate-line query. A record for Gate 57.4 must not be returned as support for a generic Gate 57 question, Gate 57.2, or another gate's Line 4.

## Critic requirements

Reject or revise an answer when it:
- simply appends a general line keyword to a gate and presents the result as a validated synthesis;
- replaces a specific named gate-line archetype with a different generic formulation;
- makes psychological or personal claims that the source does not support;
- cites a source that does not support the specific claim;
- treats two related citations as proof of a connection they do not independently establish.

If no exact gate-line source record is available, explain only the separately supported gate and line themes. Do not invent the synthesis.

## Gate 57.4 reference case

The registered IHDS Daily View item for Gate 57.4 describes the line as **The Director**. Its concise paraphrase links Gate 57's intuitive clarity with mastery of relationships through clarity and sensitivity to interrelationships, and preserves the source's polarity between directing and becoming dictatorial. This record is licensed for metadata and concise paraphrase/provenance only; do not reproduce newsletter text.

The record is conditionally linked to Gate 57 + line 4. It is not a general statement about all fourth lines, and it must not be reduced to “intuition through relationships.”

## Regression tests

- Generic Gate 57 retrieval does not include the Gate 57.4 record.
- Gate 57.4 retrieval includes the specific record and relationship.
- Gate 57.2 does not retrieve the Gate 57.4 record.
- The answer prompt receives the exact activation context and includes the gate-line synthesis rules.
- Existing graph integrity, holistic retrieval and answer-critic tests remain green.

## Verification boundary

Passing deterministic tests verifies source-record selection and prompt/critic contracts. It does not, by itself, prove a live language model will always synthesize the material correctly. That requires model-backed acceptance tests once a live provider is connected.
