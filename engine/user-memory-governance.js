/**
 * Governed user-memory lifecycle contract.
 * Pure policy only: no persistence, hidden learning, or account mutation occurs here.
 */
const MEMORY_CATEGORIES = new Set(["preference", "goal", "personal_context", "communication_style"]);
const STATUSES = new Set(["proposed", "active", "superseded", "deleted"]);
const MIN_INFERRED_CONFIDENCE = 0.8;
const MAX_VALUE_LENGTH = 2000;

export function evaluateMemoryCandidate(candidate, { personalizationConsent = false } = {}) {
  const issues = [];
  if (!candidate || typeof candidate !== "object") {
    return { accepted: false, status: "rejected", issues: ["candidate_missing"], record: null };
  }
  if (typeof candidate.value !== "string" || !candidate.value.trim()) issues.push("value_required");
  if (candidate.value?.length > MAX_VALUE_LENGTH) issues.push("value_too_long");
  if (!MEMORY_CATEGORIES.has(candidate.category)) issues.push("category_not_allowed");
  if (candidate.category === "chart_truth" || candidate.category === "source_knowledge" || candidate.category === "system_instruction") {
    issues.push("protected_domain_cannot_be_user_memory");
  }
  if (candidate.origin !== "explicit" && candidate.origin !== "inferred") issues.push("origin_invalid");
  if (!personalizationConsent) issues.push("personalization_consent_required");
  if (candidate.origin === "explicit" && candidate.user_confirmed !== true) issues.push("explicit_memory_requires_user_confirmation");
  if (candidate.origin === "inferred") {
    if (candidate.user_consent !== true) issues.push("inferred_memory_requires_consent");
    if (!Number.isFinite(candidate.confidence) || candidate.confidence < MIN_INFERRED_CONFIDENCE) issues.push("inferred_confidence_below_threshold");
  }
  if (typeof candidate.source_turn_id !== "string" || !candidate.source_turn_id.trim()) issues.push("source_turn_required");
  if (candidate.expires_at && !Number.isFinite(Date.parse(candidate.expires_at))) issues.push("expiry_invalid");

  const accepted = issues.length === 0;
  const status = !accepted ? "rejected" : candidate.origin === "explicit" ? "active" : "proposed";
  const record = accepted ? {
    id: candidate.id ?? null,
    category: candidate.category,
    value: candidate.value.trim(),
    origin: candidate.origin,
    confidence: candidate.origin === "explicit" ? 1 : candidate.confidence,
    status,
    source_turn_id: candidate.source_turn_id,
    user_confirmed: candidate.origin === "explicit",
    user_consent: true,
    created_at: candidate.created_at ?? null,
    expires_at: candidate.expires_at ?? null,
    lifecycle_version: "1.0.0"
  } : null;
  return { accepted, status, issues, record };
}

export function selectActiveMemoryForPrompt(records = [], { now = new Date().toISOString() } = {}) {
  const nowMs = Date.parse(now);
  if (!Number.isFinite(nowMs)) throw new Error("valid reference time is required");
  return records.filter(record => {
    if (!record || record.status !== "active" || record.user_consent !== true) return false;
    if (!MEMORY_CATEGORIES.has(record.category)) return false;
    if (record.origin === "inferred" && record.user_confirmed !== true) return false;
    if (typeof record.value !== "string" || !record.value.trim()) return false;
    if (record.expires_at) {
      const expires = Date.parse(record.expires_at);
      if (!Number.isFinite(expires) || expires <= nowMs) return false;
    }
    return true;
  }).map(record => ({
    id: record.id ?? null,
    category: record.category,
    value: record.value.trim(),
    origin: record.origin,
    source_turn_id: record.source_turn_id,
    expires_at: record.expires_at ?? null
  }));
}
