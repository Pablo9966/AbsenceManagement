import type {
  HandlerWorkQueueEntry,
  IntakeChecklistItem,
  MissingInformationRequest,
  TransparentBoolean,
  WorkspaceStatus,
} from "./types.js";

export const calculateWorkspaceReadyForReview = (input: {
  checklistItems: ReadonlyArray<Pick<IntakeChecklistItem, "blockingFlag" | "status">>;
  missingInformationRequests: ReadonlyArray<Pick<MissingInformationRequest, "status">>;
  workspaceStatus: WorkspaceStatus;
  effectiveAt: string;
}): TransparentBoolean => {
  const openBlockingChecklistCount = input.checklistItems.filter(
    (item) => item.blockingFlag && item.status === "open",
  ).length;
  const openMissingInformationRequestCount = input.missingInformationRequests.filter(
    (request) => request.status === "open" || request.status === "overdue",
  ).length;
  const value =
    openBlockingChecklistCount === 0 &&
    openMissingInformationRequestCount === 0 &&
    input.workspaceStatus !== "completed";

  return {
    value,
    formula: "no_open_blocking_checklist_items and no_open_missing_information_requests and workspace_status != completed",
    inputs: {
      openBlockingChecklistCount,
      openMissingInformationRequestCount,
      workspaceStatus: input.workspaceStatus,
    },
    effectiveAt: input.effectiveAt,
  };
};

export const calculateWorkspaceBlocked = (input: {
  checklistItems: ReadonlyArray<Pick<IntakeChecklistItem, "blockingFlag" | "status">>;
  missingInformationRequests: ReadonlyArray<Pick<MissingInformationRequest, "status">>;
  effectiveAt: string;
}): TransparentBoolean => {
  const openBlockingChecklistCount = input.checklistItems.filter(
    (item) => item.blockingFlag && item.status === "open",
  ).length;
  const openMissingInformationRequestCount = input.missingInformationRequests.filter(
    (request) => request.status === "open" || request.status === "overdue",
  ).length;

  return {
    value: openBlockingChecklistCount > 0 || openMissingInformationRequestCount > 0,
    formula: "open_missing_information_request_count > 0 or open_blocking_checklist_count > 0",
    inputs: {
      openBlockingChecklistCount,
      openMissingInformationRequestCount,
    },
    effectiveAt: input.effectiveAt,
  };
};

export const calculateQueueEntryOverdue = (input: {
  queueEntry: Pick<HandlerWorkQueueEntry, "slaDueAt" | "exitedAt" | "queueType">;
  referenceAt: string;
}): TransparentBoolean => ({
  value: Boolean(input.queueEntry.slaDueAt && input.queueEntry.slaDueAt < input.referenceAt && !input.queueEntry.exitedAt),
  formula: "sla_due_at < reference_at and exited_at is null",
  inputs: {
    slaDueAt: input.queueEntry.slaDueAt,
    referenceAt: input.referenceAt,
    exitedAt: input.queueEntry.exitedAt,
    queueType: input.queueEntry.queueType,
  },
  effectiveAt: input.referenceAt,
});

