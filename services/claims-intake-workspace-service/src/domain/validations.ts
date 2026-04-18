import type {
  ChecklistItemStatus,
  HandlerWorkQueueEntry,
  IntakeCaseWorkspace,
  IntakeChecklistItem,
  IntakeDecisionRecommendation,
  MissingInformationRequest,
  QueueEntryStatus,
  UpdateChecklistItemPatch,
  UpdateHandlerWorkQueueEntryPatch,
  UpdateIntakeCaseWorkspacePatch,
  UpdateMissingInformationRequestPatch,
  WorkspaceEvidenceReference,
  WorkspaceNote,
  WorkspaceStatus,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);

const allowedWorkspaceStatusTransitions: Record<WorkspaceStatus, WorkspaceStatus[]> = {
  new: ["intake_in_progress", "waiting_for_information", "completed"],
  intake_in_progress: ["waiting_for_information", "ready_for_review", "completed"],
  waiting_for_information: ["intake_in_progress", "ready_for_review", "completed"],
  ready_for_review: ["decision_pending", "waiting_for_information", "completed"],
  decision_pending: ["completed", "waiting_for_information"],
  completed: [],
};

const allowedChecklistStatusTransitions: Record<ChecklistItemStatus, ChecklistItemStatus[]> = {
  open: ["satisfied", "waived"],
  satisfied: ["open"],
  waived: ["open"],
};

const allowedRequestStatusTransitions: Record<MissingInformationRequest["status"], MissingInformationRequest["status"][]> = {
  open: ["answered", "cancelled", "overdue"],
  overdue: ["answered", "cancelled"],
  answered: [],
  cancelled: [],
};

const allowedQueueStatusTransitions: Record<QueueEntryStatus, QueueEntryStatus[]> = {
  entered: ["in_progress", "paused", "exited"],
  in_progress: ["paused", "exited"],
  paused: ["in_progress", "exited"],
  exited: [],
};

export const validateIntakeCaseWorkspace = (
  input: Pick<IntakeCaseWorkspace, "ktgCaseId" | "employeeId" | "policyId" | "submittedAt" | "lastActivityAt" | "closedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.ktgCaseId.trim()) {
    issues.push({ field: "ktgCaseId", message: "KTG-Fallreferenz ist erforderlich.", severity: "error" });
  }

  if (!input.employeeId.trim()) {
    issues.push({ field: "employeeId", message: "Mitarbeitende Person ist erforderlich.", severity: "error" });
  }

  if (!input.policyId.trim()) {
    issues.push({ field: "policyId", message: "Police ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.submittedAt)) {
    issues.push({ field: "submittedAt", message: "Einreichungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (!isIsoDateTime(input.lastActivityAt)) {
    issues.push({ field: "lastActivityAt", message: "Letzte Aktivitaet ist ungueltig.", severity: "error" });
  }

  if (input.closedAt !== undefined && !isIsoDateTime(input.closedAt)) {
    issues.push({ field: "closedAt", message: "Abschlusszeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateWorkspacePatch = (
  currentStatus: WorkspaceStatus,
  patch: UpdateIntakeCaseWorkspacePatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (patch.workspaceStatus && patch.workspaceStatus !== currentStatus && !allowedWorkspaceStatusTransitions[currentStatus].includes(patch.workspaceStatus)) {
    issues.push({
      field: "workspaceStatus",
      message: `Statuswechsel von ${currentStatus} nach ${patch.workspaceStatus} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  if (patch.lastActivityAt !== undefined && !isIsoDateTime(patch.lastActivityAt)) {
    issues.push({ field: "lastActivityAt", message: "Letzte Aktivitaet ist ungueltig.", severity: "error" });
  }

  if (patch.closedAt !== undefined && !isIsoDateTime(patch.closedAt)) {
    issues.push({ field: "closedAt", message: "Abschlusszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.assignedTeam !== undefined && !patch.assignedTeam.trim()) {
    issues.push({ field: "assignedTeam", message: "Team darf nicht leer sein.", severity: "error" });
  }

  if (patch.workspaceStatus === "completed" && patch.closedAt === undefined) {
    issues.push({ field: "closedAt", message: "Abschlusszeitpunkt wird fuer abgeschlossene Workspaces erwartet.", severity: "warning" });
  }

  return issues;
};

export const validateChecklistItem = (
  input: Pick<IntakeChecklistItem, "checkType" | "blockerCode" | "satisfiedByReferenceType" | "satisfiedByReferenceId" | "completedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.checkType.trim()) {
    issues.push({ field: "checkType", message: "Check-Typ ist erforderlich.", severity: "error" });
  }

  if (input.blockerCode !== undefined && !input.blockerCode.trim()) {
    issues.push({ field: "blockerCode", message: "Blocker-Code darf nicht leer sein.", severity: "error" });
  }

  if ((input.satisfiedByReferenceType && !input.satisfiedByReferenceId) || (!input.satisfiedByReferenceType && input.satisfiedByReferenceId)) {
    issues.push({ field: "satisfiedByReference", message: "Satisfied-by Referenz benoetigt Typ und Id.", severity: "error" });
  }

  if (input.satisfiedByReferenceId !== undefined && !input.satisfiedByReferenceId.trim()) {
    issues.push({ field: "satisfiedByReferenceId", message: "Satisfied-by Referenz darf nicht leer sein.", severity: "error" });
  }

  if (input.completedAt !== undefined && !isIsoDateTime(input.completedAt)) {
    issues.push({ field: "completedAt", message: "Abschlusszeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateChecklistItemPatch = (
  currentStatus: ChecklistItemStatus,
  patch: UpdateChecklistItemPatch,
): ValidationIssue[] => {
  const issues = validateChecklistItem({
    checkType: "valid",
    blockerCode: undefined,
    satisfiedByReferenceType: patch.satisfiedByReferenceType,
    satisfiedByReferenceId: patch.satisfiedByReferenceId,
    completedAt: patch.completedAt,
  });

  if (patch.status && patch.status !== currentStatus && !allowedChecklistStatusTransitions[currentStatus].includes(patch.status)) {
    issues.push({
      field: "status",
      message: `Statuswechsel von ${currentStatus} nach ${patch.status} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  if ((patch.status === "satisfied" || patch.status === "waived") && patch.completedAt === undefined) {
    issues.push({
      field: "completedAt",
      message: "Abschlusszeitpunkt wird fuer erledigte oder erlassene Checklist-Punkte erwartet.",
      severity: "warning",
    });
  }

  return issues;
};

export const validateMissingInformationRequest = (
  input: Pick<MissingInformationRequest, "requestReasonCode" | "requestedFromUserId" | "requestedFromRole" | "requestedAt" | "dueAt" | "resolvedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.requestReasonCode.trim()) {
    issues.push({ field: "requestReasonCode", message: "Grundcode ist erforderlich.", severity: "error" });
  }

  if (!input.requestedFromUserId && !input.requestedFromRole?.trim()) {
    issues.push({ field: "requestedFrom", message: "Rueckfrage benoetigt explizite Empfaengerzuweisung.", severity: "error" });
  }

  if (!isIsoDateTime(input.requestedAt)) {
    issues.push({ field: "requestedAt", message: "Anforderungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.dueAt !== undefined && !isIsoDateTime(input.dueAt)) {
    issues.push({ field: "dueAt", message: "Faelligkeit ist ungueltig.", severity: "error" });
  }

  if (input.resolvedAt !== undefined && !isIsoDateTime(input.resolvedAt)) {
    issues.push({ field: "resolvedAt", message: "Erledigungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.requestedAt && input.resolvedAt && input.resolvedAt < input.requestedAt) {
    issues.push({ field: "resolvedAt", message: "Erledigungszeitpunkt darf nicht vor Anforderung liegen.", severity: "error" });
  }

  return issues;
};

export const validateMissingInformationRequestPatch = (
  currentStatus: MissingInformationRequest["status"],
  patch: UpdateMissingInformationRequestPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (patch.resolvedAt !== undefined && !isIsoDateTime(patch.resolvedAt)) {
    issues.push({ field: "resolvedAt", message: "Erledigungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.status && patch.status !== currentStatus && !allowedRequestStatusTransitions[currentStatus].includes(patch.status)) {
    issues.push({
      field: "status",
      message: `Statuswechsel von ${currentStatus} nach ${patch.status} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  if (patch.status === "answered" && patch.resolvedAt === undefined) {
    issues.push({
      field: "resolvedAt",
      message: "Erledigungszeitpunkt wird fuer beantwortete Rueckfragen erwartet.",
      severity: "warning",
    });
  }

  return issues;
};

export const validateQueueEntry = (
  input: Pick<HandlerWorkQueueEntry, "enteredAt" | "exitedAt" | "exitReason">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!isIsoDateTime(input.enteredAt)) {
    issues.push({ field: "enteredAt", message: "Queue-Eintritt ist ungueltig.", severity: "error" });
  }

  if (input.exitedAt !== undefined && !isIsoDateTime(input.exitedAt)) {
    issues.push({ field: "exitedAt", message: "Queue-Austritt ist ungueltig.", severity: "error" });
  }

  if (input.exitReason !== undefined && !input.exitReason.trim()) {
    issues.push({ field: "exitReason", message: "Austrittsgrund darf nicht leer sein.", severity: "error" });
  }

  return issues;
};

export const validateQueueEntryPatch = (
  currentStatus: QueueEntryStatus,
  patch: UpdateHandlerWorkQueueEntryPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (patch.exitedAt !== undefined && !isIsoDateTime(patch.exitedAt)) {
    issues.push({ field: "exitedAt", message: "Queue-Austritt ist ungueltig.", severity: "error" });
  }

  if (patch.exitReason !== undefined && !patch.exitReason.trim()) {
    issues.push({ field: "exitReason", message: "Austrittsgrund darf nicht leer sein.", severity: "error" });
  }

  if (patch.queueStatus && patch.queueStatus !== currentStatus && !allowedQueueStatusTransitions[currentStatus].includes(patch.queueStatus)) {
    issues.push({
      field: "queueStatus",
      message: `Statuswechsel von ${currentStatus} nach ${patch.queueStatus} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  if (patch.queueStatus === "exited" && patch.exitedAt === undefined) {
    issues.push({
      field: "exitedAt",
      message: "Queue-Austrittszeitpunkt wird fuer beendete Queue-Eintraege erwartet.",
      severity: "warning",
    });
  }

  return issues;
};

export const validateWorkspaceNote = (
  input: Pick<WorkspaceNote, "message" | "createdAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.message.trim()) {
    issues.push({ field: "message", message: "Notiz darf nicht leer sein.", severity: "error" });
  }

  if (!isIsoDateTime(input.createdAt)) {
    issues.push({ field: "createdAt", message: "Zeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateRecommendation = (
  input: Pick<IntakeDecisionRecommendation, "confidence" | "summary" | "generatedAt" | "acceptedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (input.confidence !== undefined && (input.confidence < 0 || input.confidence > 1)) {
    issues.push({ field: "confidence", message: "Confidence muss zwischen 0 und 1 liegen.", severity: "error" });
  }

  if (!input.summary.trim()) {
    issues.push({ field: "summary", message: "Zusammenfassung ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.generatedAt)) {
    issues.push({ field: "generatedAt", message: "Generierungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.acceptedAt !== undefined && !isIsoDateTime(input.acceptedAt)) {
    issues.push({ field: "acceptedAt", message: "Annahmezeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateEvidenceReference = (
  input: Pick<WorkspaceEvidenceReference, "documentId" | "certificateReferenceId" | "linkConfidence" | "linkedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.documentId && !input.certificateReferenceId) {
    issues.push({ field: "evidenceReference", message: "Dokumentreferenz oder Zertifikatsreferenz ist erforderlich.", severity: "error" });
  }

  if (input.linkConfidence !== undefined && (input.linkConfidence < 0 || input.linkConfidence > 1)) {
    issues.push({ field: "linkConfidence", message: "Link-Confidence muss zwischen 0 und 1 liegen.", severity: "error" });
  }

  if (!isIsoDateTime(input.linkedAt)) {
    issues.push({ field: "linkedAt", message: "Verknuepfungszeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");
