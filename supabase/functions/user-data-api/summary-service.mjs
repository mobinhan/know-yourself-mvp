/**
 * Trusted-server summary orchestration helper.
 * Call only after authentication/ownership checks. Provider generation and
 * persistence are injected so this module never holds credentials itself.
 */
export async function summarizeConversation({
  conversationId,
  turns,
  existingSummary = null,
  existingSummaryThroughSequence = 0,
  existingSummaryVersion = 0,
  generateSummary,
  saveSummary,
  maxSummaryChars = 6000,
  preserveRecentTurns = 12
}) {
  if (!conversationId) throw new TypeError("conversation_id_required");
  if (typeof generateSummary !== "function" || typeof saveSummary !== "function") {
    throw new TypeError("trusted_summary_callbacks_required");
  }
  const ordered = [...(turns ?? [])]
    .filter(t => Number.isSafeInteger(t.sequence_number) && t.sequence_number > 0)
    .sort((a, b) => a.sequence_number - b.sequence_number);
  if (!ordered.length) return { status: "skipped", reason: "no_turns" };

  const newestSequence = ordered.at(-1).sequence_number;
  if (ordered.length <= preserveRecentTurns) {
    return { status: "skipped", reason: "recent_turns_already_within_window" };
  }
  const throughSequence = ordered[ordered.length - preserveRecentTurns - 1]?.sequence_number ?? 0;
  if (throughSequence <= existingSummaryThroughSequence) {
    return { status: "skipped", reason: "no_new_older_turns" };
  }

  const coveredTurns = ordered.filter(t =>
    t.sequence_number > existingSummaryThroughSequence &&
    t.sequence_number <= throughSequence
  );
  if (!coveredTurns.length) return { status: "skipped", reason: "no_new_older_turns" };

  const summary = await generateSummary({
    conversationId,
    previousSummary: existingSummary,
    previousThroughSequence: existingSummaryThroughSequence,
    turns: coveredTurns,
    throughSequence
  });
  if (typeof summary !== "string" || !summary.trim() || summary.trim().length > maxSummaryChars) {
    throw new TypeError("generated_summary_invalid");
  }
  const persisted = await saveSummary({
    conversationId,
    summary: summary.trim(),
    throughSequence,
    summaryVersion: existingSummaryVersion + 1
  });
  return {
    status: "saved",
    conversationId,
    throughSequence,
    newestSequence,
    summarizedTurnCount: coveredTurns.length,
    preservedRecentTurnCount: ordered.filter(t => t.sequence_number > throughSequence).length,
    persisted
  };
}
