import { retrieveHolisticContext } from "./holistic-retrieval.js";

const MAX_ANSWER_CHARS = 12000;

export function composeAnswer({ reasoningInput, synthesis }) {
  if (!reasoningInput?.ready_for_reasoning) {
    return {
      answer: "I don't have enough verified information to answer that reliably yet.",
      factual_basis: [],
      knowledge_basis: [],
      relationship_basis: [],
      interpretation: "",
      limitations: reasoningInput?.missing_evidence_targets ?? []
    };
  }

  if (!synthesis || typeof synthesis.answer !== "string" || !synthesis.answer.trim()) {
    throw new Error("reasoning synthesis must contain an answer");
  }

  const evidenceIds = new Set((reasoningInput.evidence ?? []).map(x => x.id));
  const knowledgeIds = new Set((reasoningInput.knowledge ?? []).map(x => x.id));
  const promptContext = buildReasoningPromptInput(reasoningInput);
  const allowedRelationshipIds = new Set([
    ...(promptContext.holistic_context ?? []).flatMap(context => (context.relationships ?? []).filter(edge => edge.status === "validated").map(edge => edge.id)),
    ...(promptContext.rave_psychology_context?.framework?.relationships ?? []).filter(edge => edge.status === "validated").map(edge => edge.id)
  ]);

  const factual_basis = [...new Set(synthesis.factual_basis ?? [])]
    .filter(id => evidenceIds.has(id));
  const knowledge_basis = [...new Set(synthesis.knowledge_basis ?? [])]
    .filter(id => knowledgeIds.has(id));
  const relationship_basis = [...new Set(synthesis.relationship_basis ?? [])]
    .filter(id => allowedRelationshipIds.has(id));

  const answer = synthesis.answer.trim();
  if (answer.length > MAX_ANSWER_CHARS) {
    throw new Error("reasoning synthesis exceeds answer length limit");
  }

  return {
    answer,
    factual_basis,
    knowledge_basis,
    relationship_basis,
    interpretation: typeof synthesis.interpretation === "string" ? synthesis.interpretation.trim() : "",
    limitations: Array.isArray(synthesis.limitations) ? synthesis.limitations : []
  };
}

export function buildReasoningPromptInput(reasoningInput) {
  if (!reasoningInput?.ready_for_reasoning) {
    return {
      mode: "insufficient_evidence",
      question: reasoningInput?.question ?? "",
      missing_evidence_targets: reasoningInput?.missing_evidence_targets ?? []
    };
  }

  const targetToConcept = {
    activations: "gate",
    gates: "gate",
    channels: "channel",
    centres: "centre"
  };
  const holisticConcepts = [...new Set(
    (reasoningInput.question_context?.evidence_targets ?? [])
      .map(target => targetToConcept[target])
      .filter(Boolean)
  )];
  const gateEvidence = (reasoningInput.evidence ?? []).find(record => record.id === "E-GATES");
  const activationEvidence = (reasoningInput.evidence ?? []).find(record => record.id === "E-ACTIVATIONS");
  const chartGateSet = Array.isArray(gateEvidence?.result) ? gateEvidence.result : [];
  const explicitGateMatch = reasoningInput.question.match(/\b(?:gate|gates)\s*(\d{1,2})\b/i);
  const explicitGate = explicitGateMatch ? Number(explicitGateMatch[1]) : null;
  const relevantGates = explicitGate != null ? [explicitGate] : chartGateSet;
  const holistic_context = holisticConcepts.map(concept =>
    retrieveHolisticContext({
      concept,
      maxHops: 1,
      includePending: true,
      gateNumbers: concept === "gate" ? relevantGates : [],
      chartGateSet
    })
  );

  const activations = activationEvidence?.result ?? {};
  const personalityActivations = Array.isArray(activations.personality) ? activations.personality : [];
  const getActivation = body => {
    const activation = personalityActivations.find(item => String(item.body ?? "").toLowerCase() === body);
    if (!activation) return null;
    return {
      body: activation.body,
      gate: activation.gate,
      line: activation.line,
      colour: activation.colour,
      tone: activation.tone,
      base: activation.base,
      evidence_id: activationEvidence.id
    };
  };
  const crossEvidence = (reasoningInput.evidence ?? []).find(record => record.id === "E-CROSS");
  const crossDefinition = crossEvidence?.result && typeof crossEvidence.result === "object" ? crossEvidence.result : null;
  const crossSlots = [
    ["personality_sun", "sun", "personality"],
    ["personality_earth", "earth", "personality"],
    ["design_sun", "sun", "design"],
    ["design_earth", "earth", "design"]
  ];
  const crossActivations = crossDefinition
    ? crossSlots.map(([slot, body, imprint]) => {
        const supplied = crossDefinition[slot];
        const sourceActivation = (Array.isArray(activations[imprint]) ? activations[imprint] : [])
          .find(item => String(item.body ?? "").toLowerCase() === body);
        if (!supplied || !sourceActivation || supplied.gate !== sourceActivation.gate || supplied.line !== sourceActivation.line) return null;
        const quarterContext = retrieveHolisticContext({
          concept: "gate",
          maxHops: 1,
          includePending: true,
          gateNumbers: [supplied.gate],
          chartGateSet
        });
        const quarter = (quarterContext.gate_quarter_context ?? []).find(item => item.gate === supplied.gate) ?? null;
        return {
          slot,
          imprint,
          body,
          gate: supplied.gate,
          line: supplied.line,
          evidence_id: crossEvidence.id,
          activation_evidence_id: activationEvidence?.id ?? null,
          quarter: quarter ? {
            id: quarter.quarter_id ?? null,
            name: quarter.quarter ?? null,
            theme: quarter.theme ?? null,
            mapping_status: quarter.mapping_status ?? "unknown",
            source_ids: quarter.source_ids ?? []
          } : null,
          quarter_context_evidence: quarter ? "validated_graph_lookup" : "not_available"
        };
      })
    : [];
  const incarnation_cross_context = crossActivations.length === 4 && crossActivations.every(Boolean)
    ? {
        status: "complete",
        cross_name: crossDefinition.name ?? crossDefinition.cross_name ?? null,
        cross_name_status: (crossDefinition.name ?? crossDefinition.cross_name) ? "supplied_by_deterministic_evidence" : "not_supplied_do_not_invent",
        profile: (reasoningInput.evidence ?? []).find(record => record.id === "E-PROFILE")?.result ?? null,
        primary_quarter: crossActivations.find(item => item.slot === "personality_sun")?.quarter ?? null,
        primary_quarter_anchor: "personality_sun",
        activations: crossActivations,
        evidence_ids: [crossEvidence.id, activationEvidence?.id].filter(Boolean),
        note: "Four Sun/Earth activations are verified against canonical activation evidence. Each quarter is a separate gate-level context; the Personality Sun quarter is the primary Cross anchor. No Cross name is inferred when absent."
      }
    : {
        status: "incomplete",
        missing_slots: crossSlots.filter(([slot]) => !crossActivations.some(item => item?.slot === slot)).map(([slot]) => slot),
        cross_name: null,
        evidence_ids: [crossEvidence?.id, activationEvidence?.id].filter(Boolean),
        note: "Do not claim a complete Incarnation Cross interpretation until all four Sun/Earth activations are present and agree with canonical activation evidence."
      };

  const personalitySubstructure = {
    personality_sun: getActivation("sun"),
    personality_north_node: getActivation("north_node"),
    personality_south_node: getActivation("south_node")
  };
  const hasPersonalitySubstructure = Boolean(
    personalitySubstructure.personality_sun?.colour != null ||
    personalitySubstructure.personality_north_node?.colour != null ||
    personalitySubstructure.personality_south_node?.colour != null
  );
  const rave_psychology_context = hasPersonalitySubstructure
    ? {
        framework: retrieveHolisticContext({ concept: "rave_psychology", maxHops: 2, includePending: true, personalitySunColour: personalitySubstructure.personality_sun?.colour, personalityNodeColours: [personalitySubstructure.personality_north_node?.colour, personalitySubstructure.personality_south_node?.colour].filter(value => value != null) }),
        chart_substructure: personalitySubstructure,
        relevance_note: "Use Personality Sun Color as the sourced input for Motivation and Personality Node Color as the sourced input for View. Do not infer either from the queried gate alone.",
        source_evidence_id: activationEvidence.id
      }
    : null;

  return {
    mode: "grounded_reasoning",
    question: reasoningInput.question,
    question_context: reasoningInput.question_context,
    evidence: reasoningInput.evidence,
    knowledge: reasoningInput.knowledge,
    external_knowledge: reasoningInput.external_knowledge ?? [],
    holistic_context,
    rave_psychology_context,
    incarnation_cross_context,
    instructions: [
      "Answer the user's question naturally and directly.",
      "Use supplied evidence as the only source of chart mechanics.",
      "Use all relevant supplied evidence; do not omit a relevant mechanical result merely because it is not a headline field.",
      "Use incarnation_cross_context as the first-class Cross structure. When complete, connect all four Sun/Earth gate-line activations, their separately sourced quarter contexts, profile if supplied, and the Personality Sun quarter as the primary Cross anchor. Do not invent a Cross name if deterministic evidence does not supply one. If the context is incomplete, state the missing elements rather than presenting a complete Cross reading.",
      "If the user asks for a general Human Design/chart summary, include relevant supplied foundation fields such as type, strategy, authority, profile, definition, centres, channels, gates, incarnation-cross components, and planetary activations when present and useful; do not dump all data when it is not useful.",
      "Never claim that a chart fact or calculation is unavailable when that fact is present in the supplied evidence.",
      "Use controlled knowledge to explain meaning; do not reproduce source text.",
      "Use holistic_context to connect relevant concepts only through supplied validated relationships and supporting knowledge-record IDs.",
      "For every material cross-concept claim, include the relevant supplied validated graph relationship ID in relationship_basis. Never cite an absent, pending or unrelated relationship.",
      "Treat holistic_context.unresolved_context as evidence gaps, never as established claims. Do not invent Quarter or Rave Psychology interpretations when supporting records are absent.",
      "Quarter mapping context is provisional where labelled provisional; disclose that status when it materially affects the answer.",
      "Use Rave Psychology only through supplied, traceable Personality Sun / Personality Node substructure. Motivation is linked to Personality Sun Color and View to Personality Node Color; do not infer these values from a gate theme or from missing data.",
      "A gate's Quarter is wheel-level context, while Rave Psychology is a separate substructure lens; do not imply that the gate alone determines a person's Motivation or View.",
      "Apply any conditional Rave Psychology relationship only when its applies_when Color conditions match the supplied chart substructure. A matching Color 6-to-3 transference reference is an observational framework, not proof that the person is currently in transference.",
      "If external_knowledge.conflict_sets contains a relevant disagreement, preserve the distinct claims and their provenance, disclose uncertainty, and do not silently merge or choose a winner.",
      "Use external blogs, videos, podcasts and practitioner material only as interpretation, practical-example or critical-context enrichment; never use it to override deterministic evidence.",
      "Separate mechanical facts from interpretation.",
      "Do not calculate, infer, or invent Human Design mechanics.",
      "If the evidence does not support a claim, do not make the claim.",
      "For timing, use only supplied temporal evidence."
    ]
  };
}
