/**
 * Correction-record governance policy for the KY 3framework.
 * Pure validation only: no persistence, hidden learning, or chart/knowledge mutation.
 */
const CATEGORIES = new Set([
  "chart_mechanics",
  "source_knowledge",
  "interpretation",
  "user_context",
  "product_behavior",
  "workflow"
]);
const SCOPES = new Set([
  "user_specific",
  "shared_knowledge",
  "canonical_mechanics",
  "reasoning_rule",
  "test_case",
  "engineering_workflow"
]);
const REPORTERS = new Set(["user", "assistant", "automated_test", "external_source"]);
const STATUSES = new Set(["reported", "under_review", "verified", "rejected", "superseded"]);
const MAX_SUMMARY_LENGTH = 1200;

export function evaluateCorrectionCandidate(candidate) {
  const issues = [];
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return { accepted: false, status: "rejected", issues: ["candidate_missing"], record: null };
  }

  if (typeof candidate.summary !== "string" || !candidate.summary.trim()) issues.push("summary_required");
  if (typeof candidate.summary === "string" && candidate.summary.length > MAX_SUMMARY_LENGTH) issues.push("summary_too_long");
  if (!CATEGORIES.has(candidate.category)) issues.push("category_invalid");
  if (!SCOPES.has(candidate.scope)) issues.push("scope_invalid");
  if (!REPORTERS.has(candidate.reporter)) issues.push("reporter_invalid");
  if (typeof candidate.source_ref !== "string" || !candidate.source_ref.trim()) issues.push("source_ref_required");
  if (candidate.persistence_consent !== true) issues.push("persistence_consent_required");

  const requestedStatus = candidate.status ?? "reported";
  if (!STATUSES.has(requestedStatus)) issues.push("status_invalid");
  if (requestedStatus === "verified") {
    if (typeof candidate.reviewer !== "string" || !candidate.reviewer.trim()) issues.push("verified_requires_reviewer");
    if (typeof candidate.resolution !== "string" || !candidate.resolution.trim()) issues.push("verified_requires_resolution");
    if (!Array.isArray(candidate.evidence_refs) || candidate.evidence_refs.length === 0) issues.push("verified_requires_evidence_refs");
  }
  if (candidate.category === "chart_mechanics" && candidate.scope !== "canonical_mechanics") {
    issues.push("chart_mechanics_must_use_canonical_scope");
  }
  if (candidate.scope === "canonical_mechanics" && requestedStatus === "verified" && candidate.regression_test_ref == null) {
    issues.push("verified_mechanics_change_requires_regression_test_ref");
  }
  if (requestedStatus === "superseded" && (typeof candidate.superseded_by !== "string" || !candidate.superseded_by.trim())) {
    issues.push("superseded_requires_successor");
  }

  const accepted = issues.length === 0;
  const status = accepted ? requestedStatus : "rejected";
  const record = accepted ? {
    id: candidate.id ?? null,
    category: candidate.category,
    scope: candidate.scope,
    summary: candidate.summary.trim(),
    reporter: candidate.reporter,
    source_ref: candidate.source_ref,
    persistence_consent: true,
    status,
    evidence_refs: Array.isArray(candidate.evidence_refs) ? [...new Set(candidate.evidence_refs.filter(x => typeof x === "string" && x.trim()))] : [],
    related_test_ref: candidate.regression_test_ref ?? candidate.related_test_ref ?? null,
    reviewer: candidate.reviewer ?? null,
    resolution: candidate.resolution ?? null,
    superseded_by: candidate.superseded_by ?? null,
    created_at: candidate.created_at ?? null,
    reviewed_at: candidate.reviewed_at ?? null,
    record_version: "1.0.0"
  } : null;

  return {
    accepted,
    status,
    issues,
    record,
    canonical_source_mutation_allowed: false
  };
}

/**
 * The governance layer never mutates canonical chart mechanics, even for verified
 * records. A separately reviewed code/data change and regression run are required.
 */
export function mayMutateCanonicalSource() {
  return false;
}
