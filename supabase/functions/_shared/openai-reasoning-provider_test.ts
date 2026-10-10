import { assertEquals, assertRejects } from "jsr:@std/assert";
import { createOpenAIReasoningProvider } from "./openai-reasoning-provider.ts";

Deno.test("OpenAI provider sends request server-side and validates grounded JSON result", async () => {
  let requestUrl = "";
  let requestInit: RequestInit | undefined;
  const provider = createOpenAIReasoningProvider({
    apiKey: "test-secret",
    model: "test-model",
    fetchImpl: async (url, init) => {
      requestUrl = String(url);
      requestInit = init;
      return new Response(JSON.stringify({
        choices: [{ message: { content: JSON.stringify({
          answer: "A grounded answer.",
          factual_basis: ["ev-1"],
          knowledge_basis: ["kn-1"],
          relationship_basis: [],
          interpretation: "Concise rationale.",
          limitations: []
        }) } }]
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  });
  const result = await provider.generate({ mode: "grounded_reasoning", input: { question: "test" } });
  assertEquals(requestUrl, "https://api.openai.com/v1/chat/completions");
  assertEquals((requestInit?.headers as Record<string, string>).Authorization, "Bearer test-secret");
  assertEquals(result.answer, "A grounded answer.");
  assertEquals(result.factual_basis, ["ev-1"]);
});

Deno.test("OpenAI provider rejects missing key", () => {
  let caught = false;
  try { createOpenAIReasoningProvider({ apiKey: "" }); } catch (error) {
    caught = error instanceof Error && error.message === "openai_api_key_required";
  }
  assertEquals(caught, true);
});

Deno.test("OpenAI provider rejects invalid response contract", async () => {
  const provider = createOpenAIReasoningProvider({
    apiKey: "test-secret",
    fetchImpl: async () => new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ answer: "Incomplete" }) } }]
    }), { status: 200 })
  });
  await assertRejects(
    () => provider.generate({ mode: "grounded_reasoning", input: { question: "test" } }),
    Error,
    "reasoning_provider_missing_answer_fields"
  );
});
