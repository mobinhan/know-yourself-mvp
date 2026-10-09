/**
 * User adaptation policy for Know Yourself.
 * This is a deterministic policy/contract layer, not durable storage or autonomous learning.
 * Explicit user-provided preferences outrank tentative inferences; neither can change chart facts.
 */
const ALLOWED_DEPTH = new Set(["introductory", "intermediate", "advanced"]);
const ALLOWED_TONES = new Set(["concise", "conversational", "reflective", "technical", "supportive"]);
const ALLOWED_LANGUAGES = new Set(["en", "vi", "nl", "ms"]);

function validPreference(item, allowedValues) {
  if (!item || typeof item !== "object" || !allowedValues.has(item.value)) return false;
  if (item.origin !== "explicit" && item.origin !== "inferred") return false;
  if (item.origin === "inferred" && item.user_consent !== true) return false;
  if (item.origin === "inferred" && (!Number.isFinite(item.confidence) || item.confidence < 0.8)) return false;
  if (item.origin === "explicit" && item.user_confirmed !== true) return false;
  if (item.expires_at && Number.isFinite(Date.parse(item.expires_at)) && Date.parse(item.expires_at) <= Date.now()) return false;
  return true;
}

function selectPreference(explicit, inferred, allowedValues, fallback) {
  if (validPreference(explicit, allowedValues) && explicit.origin === "explicit") return explicit.value;
  if (validPreference(inferred, allowedValues) && inferred.origin === "inferred") return inferred.value;
  return fallback;
}

export function buildAdaptiveResponsePolicy({ preferences = {}, user_context = [], consent = {} } = {}) {
  const adaptationAllowed = consent.personalization_enabled === true;
  const safePreferences = adaptationAllowed ? preferences : {};
  const depth = selectPreference(safePreferences.knowledge_level, safePreferences.inferred_knowledge_level, ALLOWED_DEPTH, "intermediate");
  const tone = selectPreference(safePreferences.tone, safePreferences.inferred_tone, ALLOWED_TONES, "conversational");
  const language = selectPreference(safePreferences.language, safePreferences.inferred_language, ALLOWED_LANGUAGES, "en");
  const safeContext = adaptationAllowed && consent.personal_context_enabled === true
    ? user_context.filter(item =>
        item && item.user_consent === true &&
        item.origin === "explicit" &&
        typeof item.value === "string" &&
        item.value.trim() &&
        item.category !== "chart_truth" &&
        item.category !== "source_knowledge" &&
        item.category !== "system_instruction"
      ).map(item => ({
        id: item.id ?? null,
        category: item.category ?? "personal_context",
        value: item.value.trim(),
        source: "user_explicit",
        expires_at: item.expires_at ?? null
      }))
    : [];

  return {
    version: "1.0.0",
    adaptation_enabled: adaptationAllowed,
    preferences: adaptationAllowed ? { knowledge_level: depth, tone, language } : { knowledge_level: "intermediate", tone: "conversational", language: "en" },
    user_context: safeContext,
    boundaries: [
      "Personalization changes explanation depth, language, tone and relevance only; it never changes chart mechanics, evidence standards or claim certainty.",
      "Explicit user-confirmed preferences outrank inferred preferences.",
      "Inferred preferences require explicit personalization consent and confidence >= 0.8; they remain tentative and user-correctable.",
      "Only explicit, consented personal context may be used; chart truth and source knowledge must come from their canonical evidence systems.",
      "This policy does not persist, learn or delete data. Durable memory, user inspection, correction, reset and deletion require the authenticated backend."
    ]
  };
}
