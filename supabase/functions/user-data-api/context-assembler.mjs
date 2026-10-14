/**
 * Know Yourself Layer 2 context assembler.
 *
 * Pure assembly utility: retrieval/authentication must happen before this
 * function. The caller supplies the verified canonical chart artifact,
 * validated evidence, and consent-filtered memories/turns. The caller must
 * inject the selected provider's tokenizer for exact accounting.
 */
export function assembleContext(input, options = {}) {
  const budget = Number.isSafeInteger(options.maxTokens) && options.maxTokens > 0
    ? options.maxTokens : 4000;
  const countTokens = options.countTokens;
  if (typeof countTokens !== "function") {
    throw new TypeError("countTokens must be the configured provider tokenizer");
  }
  if (!input || typeof input.question !== "string" || !input.question.trim()) {
    throw new TypeError("question_required");
  }

  const payload = {
    instructions: String(input.instructions ?? ""),
    question: input.question.trim(),
    canonical_chart: null,
    evidence: [],
    memories: [],
    summary: null,
    recent_turns: []
  };
  const log = [];
  const count = (value) => countTokens(JSON.stringify(value));
  const initialTokens = count(payload);
  if (initialTokens > budget) {
    throw new RangeError("fixed_prompt_exceeds_token_budget");
  }

  const candidates = [];
  if (input.canonicalChart != null) {
    candidates.push({ section: "canonical_chart", id: "canonical_chart", value: input.canonicalChart, priority: 0 });
  }
  for (const item of input.evidence ?? []) candidates.push({
    section: "evidence", id: String(item.id ?? "evidence"), value: item, priority: 1
  });
  for (const item of input.memories ?? []) candidates.push({
    section: "memories", id: String(item.id ?? "memory"), value: item, priority: 2
  });
  if (input.summary?.text && Number.isSafeInteger(input.summary.throughSequence)) {
    candidates.push({ section: "summary", id: "conversation_summary", value: input.summary, priority: 3 });
  }
  const turns = [...(input.turns ?? [])]
    .filter(t => Number.isSafeInteger(t.sequence_number) && t.sequence_number > 0)
    .sort((a, b) => b.sequence_number - a.sequence_number)
    .slice(0, Number.isSafeInteger(options.maxTurns) ? Math.max(0, options.maxTurns) : 12);
  for (const turn of turns) candidates.push({
    section: "recent_turns", id: String(turn.sequence_number), value: turn, priority: 4,
    sequence: turn.sequence_number
  });

  candidates.sort((a, b) => a.priority - b.priority ||
    (a.section === "recent_turns" ? b.sequence - a.sequence : 0));

  let usedTokens = initialTokens;
  for (const candidate of candidates) {
    const target = candidate.section;
    const previous = payload[target];
    if (target === "canonical_chart") payload[target] = candidate.value;
    else if (target === "summary") payload[target] = {
      text: candidate.value.text,
      through_sequence: candidate.value.throughSequence
    };
    else payload[target] = [...previous, candidate.value];

    const measured = count(payload);
    if (measured <= budget) {
      usedTokens = measured;
      log.push({ section: target, id: candidate.id, action: "included", tokens_after: measured });
    } else {
      payload[target] = previous;
      log.push({ section: target, id: candidate.id, action: "trimmed_budget", tokens_before: usedTokens });
    }
  }

  payload.recent_turns.sort((a, b) => a.sequence_number - b.sequence_number);

  // The final measurement is authoritative. Never rely on sum-of-section
  // estimates because tokenizer overhead and JSON serialization are nonlinear.
  usedTokens = count(payload);
  if (usedTokens > budget) throw new RangeError("assembled_context_exceeds_token_budget");

  return {
    context: payload,
    metrics: {
      budget_tokens: budget,
      measured_tokens: usedTokens,
      remaining_tokens: budget - usedTokens,
      recent_turns_included: payload.recent_turns.length,
      trimmed_items: log.filter(entry => entry.action === "trimmed_budget").length,
      trimming_log: log
    }
  };
}

/** Eligibility filter for memory rows; relevance ranking remains caller-owned. */
export function eligibleMemories(memories, preferences, now = new Date()) {
  if (!preferences?.personalization_enabled) return [];
  return (memories ?? []).filter(memory => {
    if (memory.status !== "active" || memory.user_consent !== true ||
        memory.user_confirmed !== true) return false;
    if (memory.expires_at && Date.parse(memory.expires_at) <= now.getTime()) return false;
    if (memory.category === "personal_context" && preferences.personal_context_enabled !== true) return false;
    return ["preference", "goal", "personal_context", "communication_style"].includes(memory.category);
  });
}
