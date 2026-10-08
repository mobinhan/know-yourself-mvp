const MAX_TURNS = 20;
const MAX_CHARS_PER_FIELD = 12000;

function cleanText(value) {
  return String(value ?? "").trim().slice(0, MAX_CHARS_PER_FIELD);
}

export function createConversationContext({ conversationId = null, userId = null } = {}) {
  return {
    version: "1.0.0",
    conversation_id: conversationId,
    user_id: userId,
    turns: []
  };
}

export function appendTurn(context, { role, question = "", answer = "", factual_basis = [], knowledge_basis = [] }) {
  if (!context || context.version !== "1.0.0") throw new Error("conversation context version is unsupported");
  if (!["user", "assistant"].includes(role)) throw new Error("invalid conversation role");

  const next = {
    ...context,
    turns: [
      ...(context.turns ?? []),
      {
        role,
        question: cleanText(question),
        answer: cleanText(answer),
        factual_basis: [...new Set(factual_basis)],
        knowledge_basis: [...new Set(knowledge_basis)]
      }
    ]
  };

  if (next.turns.length > MAX_TURNS) {
    next.turns = next.turns.slice(-MAX_TURNS);
  }

  return next;
}

export function buildConversationContextForReasoning(context) {
  if (!context || context.version !== "1.0.0") throw new Error("conversation context version is unsupported");

  return {
    version: context.version,
    conversation_id: context.conversation_id,
    turns: (context.turns ?? []).map(turn => ({
      role: turn.role,
      question: cleanText(turn.question),
      answer: cleanText(turn.answer),
      factual_basis: [...new Set(turn.factual_basis ?? [])],
      knowledge_basis: [...new Set(turn.knowledge_basis ?? [])]
    }))
  };
}

export function resolveFollowUpQuestion({ currentQuestion, context }) {
  const question = cleanText(currentQuestion);
  if (!question) throw new Error("current question is required");

  const turns = context?.turns ?? [];
  const previous = turns.length ? turns[turns.length - 1] : null;
  const isShortFollowUp = question.split(/\s+/).filter(Boolean).length <= 8;

  return {
    question,
    likely_follow_up: Boolean(previous && isShortFollowUp),
    previous_turn: previous
  };
}
