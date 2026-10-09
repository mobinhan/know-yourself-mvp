// Pure assembly for the user's cross-session continuity context.
// This module does not calculate chart mechanics or write persistent data.
export function buildContinuityContext({
  preferences = null,
  memories = [],
  conversations = [],
  turnsByConversation = {},
  savedInsights = [],
  now = new Date().toISOString(),
  maxTurnsPerConversation = 6,
  maxSavedInsights = 5,
} = {}) {
  const personalizationEnabled = preferences?.personalization_enabled === true;
  const personalContextEnabled = preferences?.personal_context_enabled === true;
  const nowMs = Date.parse(now);
  const activeMemories = personalizationEnabled
    ? memories.filter((memory) => {
        if (memory.status !== "active" || memory.user_consent !== true || memory.user_confirmed !== true) return false;
        if (memory.expires_at && Date.parse(memory.expires_at) <= nowMs) return false;
        if (memory.category === "personal_context" || memory.category === "goal") return personalContextEnabled;
        return true;
      }).map(({ id, category, value, origin, confidence, created_at, expires_at }) => ({
        id, category, value, origin, confidence, created_at, expires_at
      }))
    : [];

  const recentConversations = conversations
    .filter((conversation) => conversation.status === "active")
    .slice(0, 3)
    .map(({ id, title, chart_id, updated_at }) => ({
      id,
      title,
      chart_id,
      updated_at,
      turns: (turnsByConversation[id] ?? [])
        .filter((turn) => turn.role === "user" || turn.role === "assistant")
        .slice(-maxTurnsPerConversation)
        .map(({ id: turnId, role, question, answer, factual_basis, knowledge_basis, relationship_basis, created_at }) => ({
          id: turnId, role, question, answer, factual_basis, knowledge_basis, relationship_basis, created_at
        }))
    }));

  const insights = personalizationEnabled
    ? savedInsights.slice(0, maxSavedInsights).map(({ id, chart_id, title, content, factual_basis, knowledge_basis, relationship_basis, created_at }) => ({
        id, chart_id, title, content, factual_basis, knowledge_basis, relationship_basis, created_at
      }))
    : [];

  return {
    schema_version: "ky-continuity-context-v1",
    personalization_enabled: personalizationEnabled,
    personal_context_enabled: personalContextEnabled,
    preferences: personalizationEnabled && preferences ? {
      language: preferences.language,
      knowledge_level: preferences.knowledge_level,
      tone: preferences.tone,
      language_confirmed: preferences.language_confirmed,
      knowledge_level_confirmed: preferences.knowledge_level_confirmed,
      tone_confirmed: preferences.tone_confirmed
    } : null,
    memories: activeMemories,
    recent_conversations: recentConversations,
    saved_insights: insights,
    boundaries: {
      canonical_chart_source: "deterministic_engine_only",
      conversation_history_is_not_chart_truth: true,
      memories_require_consent_confirmation_and_non_expiry: true
    }
  };
}
