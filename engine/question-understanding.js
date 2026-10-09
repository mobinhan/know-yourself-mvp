const CONTRACT = "1.0.0";

const DOMAIN_HINTS = [
  ["career_purpose", ["career","work","job","purpose","profession","business"]],
  ["money_prosperity", ["money","finance","wealth","income","prosperity"]],
  ["relationships_love", ["relationship","love","partner","marriage","dating"]],
  ["life_direction_major_decisions", ["decision","direction","change","choice","next step"]],
  ["self_personal_development", ["self","growth","development","confidence","identity"]],
  ["timing_life_events", ["when","timing","transit","cycle","return","this year","lately"]]
];

export function understandQuestion(question) {
  if (typeof question !== "string" || !question.trim()) throw new Error("question is required");
  const normalized = question.trim().toLowerCase();
  const domains = DOMAIN_HINTS.filter(([,words]) => words.some(w => normalized.includes(w))).map(([d]) => d);
  const intent = normalized.startsWith("when ") || normalized.includes("timing") || normalized.includes("transit")
    ? "timing"
    : normalized.startsWith("what ") || normalized.startsWith("which ") || normalized.startsWith("who ")
      ? "factual"
      : "interpretive";
  const requires_timing = intent === "timing" || /\b(when|today|now|currently|recently|lately|next|future|past)\b/.test(normalized);
  const crossRequested = /\b(incarnation cross|my cross|cross of incarnation|cross)\b/.test(normalized);
  const evidenceTargets = requires_timing ? ["temporal_state","lifecycle_event","activations"] : ["type","strategy","authority","profile","definition","channels","centres","gates","activations"];
  if (crossRequested && !evidenceTargets.includes("cross")) evidenceTargets.push("cross");
  return {
    contract_version: CONTRACT,
    question: question.trim(),
    intent,
    domains: domains.length ? domains : ["general"],
    evidence_targets: evidenceTargets,
    requires_timing
  };
}
