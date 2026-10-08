const REQUIRED_MODEL_FIELDS = ["answer","factual_basis","knowledge_basis","interpretation","limitations"];

export function validateReasoningProvider(provider) {
  if (!provider || typeof provider.generate !== "function") {
    throw new Error("reasoning provider must expose generate(input)");
  }
  return true;
}

export async function runReasoningProvider({ provider, reasoningInput }) {
  validateReasoningProvider(provider);
  if (!reasoningInput?.ready_for_reasoning) {
    return {
      answer: "I don't have enough verified information to answer that reliably yet.",
      factual_basis: [],
      knowledge_basis: [],
      interpretation: "",
      limitations: reasoningInput?.missing_evidence_targets ?? []
    };
  }

  const result = await provider.generate({
    mode: "grounded_reasoning",
    input: reasoningInput
  });

  for (const field of REQUIRED_MODEL_FIELDS) {
    if (!(field in (result ?? {}))) throw new Error(`provider response missing ${field}`);
  }

  return result;
}

export const mockReasoningProvider = {
  async generate({ input }) {
    return {
      answer: `Grounded response to: ${input.question}`,
      factual_basis: (input.evidence ?? []).map(x => x.id),
      knowledge_basis: (input.knowledge ?? []).map(x => x.id),
      interpretation: "Provider-generated interpretation based only on supplied evidence and knowledge.",
      limitations: []
    };
  }
};
