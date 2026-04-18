import type { TransparentBoolean } from "./types.js";

export const calculateProjectionFresh = (input: {
  lastProcessedAt?: string;
  freshnessThresholdAnchor: string;
  sourceService: string;
  sourceStream: string;
}): TransparentBoolean => {
  const value = Boolean(input.lastProcessedAt && input.lastProcessedAt >= input.freshnessThresholdAnchor);

  return {
    value,
    formula: "last_processed_at >= freshness_threshold_anchor",
    inputs: {
      lastProcessedAt: input.lastProcessedAt,
      freshnessThresholdAnchor: input.freshnessThresholdAnchor,
      sourceService: input.sourceService,
      sourceStream: input.sourceStream,
    },
    effectiveAt: input.freshnessThresholdAnchor,
  };
};

export const calculateSnapshotStale = (input: {
  refreshedAt: string;
  staleAfterAnchor: string;
  dashboardRole: string;
  projectionType: string;
}): TransparentBoolean => {
  const value = input.refreshedAt < input.staleAfterAnchor;

  return {
    value,
    formula: "refreshed_at < stale_after_anchor",
    inputs: {
      refreshedAt: input.refreshedAt,
      staleAfterAnchor: input.staleAfterAnchor,
      dashboardRole: input.dashboardRole,
      projectionType: input.projectionType,
    },
    effectiveAt: input.staleAfterAnchor,
  };
};

