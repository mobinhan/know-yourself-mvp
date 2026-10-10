import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type ReasoningResult = {
  answer: string;
  factual_basis: string[];
  knowledge_basis: string[];
  relationship_basis: string[];
  interpretation: string;
  limitations: string[];
};

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

const REQUIRED_STRING_ARRAYS = ["factual_basis", "knowledge_basis", "relationship_basis", "limitations"] as const;

function validateResult(value: unknown): ReasoningResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("reasoning_provider_invalid_json_object");
  }
  const result = value as Record<string, unknown>;
  if (typeof result.answer !== "string" || typeof result.interpretation !== "string") {
    throw new Error("reasoning_provider_missing_answer_fields");
  }
  for (const key of REQUIRED_STRING_ARRAYS) {
    if (!Array.isArray(result[key]) || !(result[key] as unknown[]).every((item) => typeof item === "string")) {
      throw new Error(`reasoning_provider_invalid_${key}`);
    }
  }
  return {
    answer: result.answer,
    factual_basis: result.factual_basis as string[],
    knowledge_basis: result.knowledge_basis as string[],
    relationship_basis: result.relationship_basis as string[],
    interpretation: result.interpretation,
    limitations: result.limitations as string[]
  };
}

/**
 * Server-only OpenAI Chat Completions adapter.
 * Never import this module into browser code or expose apiKey to a client.
 * The caller must provide a trusted, server-assembled 3framework input packet.
 */
export function createOpenAIReasoningProvider({
  apiKey,
  model = "gpt-4.1-mini",
  fetchImpl = fetch
}: {
  apiKey: string;
  model?: string;
  fetchImpl?: FetchLike;
}) {
  if (!apiKey?.trim()) throw new Error("openai_api_key_required");
  if (!model?.trim()) throw new Error("openai_model_required");

  return {
    async generate({ mode, input }: { mode: string; input: Record<string, unknown> }): Promise<ReasoningResult> {
      if (mode !== "grounded_reasoning") throw new Error("unsupported_reasoning_mode");
      const response = await fetchImpl("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: [
                "You are the live reasoning component for Know Yourself's approved three-layer framework.",
                "Treat layer_1_canonical_evidence as the only authority for chart mechanics and factual chart claims.",
                "Use layer_2_adaptive_user_context only when relevant; it must never override canonical chart facts.",
                "Do not invent chart facts, source claims, evidence IDs, knowledge IDs, or relationship IDs.",
                "Use only identifiers supplied in the input for factual_basis, knowledge_basis, and relationship_basis.",
                "Clearly distinguish sourced facts from interpretation. If evidence is insufficient, say so and list the limitation.",
                "Return only a JSON object with answer, factual_basis, knowledge_basis, relationship_basis, interpretation, and limitations.",
                "The interpretation field must be a concise rationale, not hidden chain-of-thought."
              ].join(" ")
            },
            {
              role: "user",
              content: JSON.stringify(input)
            }
          ]
        })
      });

      if (!response.ok) {
        // Do not include provider response bodies that might contain sensitive details in client-facing errors.
        throw new Error(`openai_reasoning_request_failed_${response.status}`);
      }
      const payload = await response.json() as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        throw new Error("openai_reasoning_empty_response");
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("openai_reasoning_response_not_json");
      }
      return validateResult(parsed);
    }
  };
}
