import type {
  DeliveryStatus,
  InboxItem,
  InboxItemAssignment,
  InboxStatus,
  NotificationDelivery,
  NotificationEvent,
  NotificationPreference,
  NotificationTemplate,
  UpdateInboxItemPatch,
  UpdateNotificationDeliveryPatch,
  UpdateNotificationPreferencePatch,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);
const isTime = (value: string): boolean => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const allowedInboxStatusTransitions: Record<InboxStatus, InboxStatus[]> = {
  open: ["acknowledged", "resolved", "cancelled"],
  acknowledged: ["resolved", "cancelled"],
  resolved: [],
  cancelled: [],
};

const allowedDeliveryStatusTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ["queued", "suppressed"],
  queued: ["sent", "failed"],
  failed: ["queued"],
  sent: [],
  suppressed: [],
};

export const validateNotificationEvent = (
  input: Pick<NotificationEvent, "sourceId" | "triggeredAt" | "payload">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.sourceId.trim()) {
    issues.push({ field: "sourceId", message: "Quellreferenz ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.triggeredAt)) {
    issues.push({ field: "triggeredAt", message: "Trigger-Zeitpunkt ist ungueltig.", severity: "error" });
  }

  if (Object.keys(input.payload).length === 0) {
    issues.push({ field: "payload", message: "Payload darf nicht leer sein.", severity: "warning" });
  }

  return issues;
};

export const validateInboxItem = (
  input: Pick<InboxItem, "title" | "summary" | "audienceType" | "audienceUserId" | "audienceRole" | "createdAt" | "dueAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.title.trim()) {
    issues.push({ field: "title", message: "Titel ist erforderlich.", severity: "error" });
  }

  if (!input.summary.trim()) {
    issues.push({ field: "summary", message: "Zusammenfassung ist erforderlich.", severity: "error" });
  }

  if (input.audienceType === "user" && !input.audienceUserId?.trim()) {
    issues.push({ field: "audienceUserId", message: "Audience-User ist erforderlich.", severity: "error" });
  }

  if (input.audienceType === "role" && !input.audienceRole?.trim()) {
    issues.push({ field: "audienceRole", message: "Audience-Rolle ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.createdAt)) {
    issues.push({ field: "createdAt", message: "Erstellungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.dueAt !== undefined && !isIsoDateTime(input.dueAt)) {
    issues.push({ field: "dueAt", message: "Faelligkeit ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateInboxItemPatch = (
  currentStatus: InboxStatus,
  patch: UpdateInboxItemPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (patch.readAt !== undefined && !isIsoDateTime(patch.readAt)) {
    issues.push({ field: "readAt", message: "Lesezeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.resolvedAt !== undefined && !isIsoDateTime(patch.resolvedAt)) {
    issues.push({ field: "resolvedAt", message: "Zeitpunkt fuer Erledigung ist ungueltig.", severity: "error" });
  }

  if (patch.status && patch.status !== currentStatus && !allowedInboxStatusTransitions[currentStatus].includes(patch.status)) {
    issues.push({
      field: "status",
      message: `Statuswechsel von ${currentStatus} nach ${patch.status} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  return issues;
};

export const validateInboxItemAssignment = (
  input: Pick<InboxItemAssignment, "assignedUserId" | "assignedRole" | "assignedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.assignedUserId && !input.assignedRole) {
    issues.push({ field: "assignedUserId", message: "Zuweisung benoetigt User oder Rolle.", severity: "error" });
  }

  if (input.assignedRole !== undefined && !input.assignedRole.trim()) {
    issues.push({ field: "assignedRole", message: "Zugewiesene Rolle darf nicht leer sein.", severity: "error" });
  }

  if (!isIsoDateTime(input.assignedAt)) {
    issues.push({ field: "assignedAt", message: "Zuweisungszeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateNotificationPreference = (
  input: Pick<NotificationPreference, "locale" | "quietHoursStart" | "quietHoursEnd">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.locale.trim()) {
    issues.push({ field: "locale", message: "Locale ist erforderlich.", severity: "error" });
  }

  if (input.quietHoursStart !== undefined && !isTime(input.quietHoursStart)) {
    issues.push({ field: "quietHoursStart", message: "Quiet-Hours-Start ist ungueltig.", severity: "error" });
  }

  if (input.quietHoursEnd !== undefined && !isTime(input.quietHoursEnd)) {
    issues.push({ field: "quietHoursEnd", message: "Quiet-Hours-Ende ist ungueltig.", severity: "error" });
  }

  if ((input.quietHoursStart && !input.quietHoursEnd) || (!input.quietHoursStart && input.quietHoursEnd)) {
    issues.push({ field: "quietHours", message: "Quiet Hours benoetigen Start und Ende.", severity: "error" });
  }

  return issues;
};

export const validateNotificationPreferencePatch = (
  patch: UpdateNotificationPreferencePatch,
): ValidationIssue[] => validateNotificationPreference({
  locale: patch.locale ?? "de-CH",
  quietHoursStart: patch.quietHoursStart,
  quietHoursEnd: patch.quietHoursEnd,
});

export const validateNotificationTemplate = (
  input: Pick<NotificationTemplate, "scopeType" | "tenantId" | "language" | "bodyTemplate" | "version">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (input.scopeType === "tenant" && !input.tenantId?.trim()) {
    issues.push({ field: "tenantId", message: "Tenant-Template benoetigt tenantId.", severity: "error" });
  }

  if (input.scopeType === "global" && input.tenantId) {
    issues.push({ field: "tenantId", message: "Globales Template darf kein tenantId tragen.", severity: "error" });
  }

  if (!input.language.trim()) {
    issues.push({ field: "language", message: "Sprache ist erforderlich.", severity: "error" });
  }

  if (!input.bodyTemplate.trim()) {
    issues.push({ field: "bodyTemplate", message: "Body-Template ist erforderlich.", severity: "error" });
  }

  if (input.version <= 0) {
    issues.push({ field: "version", message: "Version muss groesser als 0 sein.", severity: "error" });
  }

  return issues;
};

export const validateNotificationDelivery = (
  input: Pick<NotificationDelivery, "triggeredAt">,
): ValidationIssue[] => {
  if (!isIsoDateTime(input.triggeredAt)) {
    return [{ field: "triggeredAt", message: "Trigger-Zeitpunkt ist ungueltig.", severity: "error" }];
  }

  return [];
};

export const validateNotificationDeliveryPatch = (
  currentStatus: DeliveryStatus,
  patch: UpdateNotificationDeliveryPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (patch.sentAt !== undefined && !isIsoDateTime(patch.sentAt)) {
    issues.push({ field: "sentAt", message: "Sendezeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.failureReason !== undefined && !patch.failureReason.trim()) {
    issues.push({ field: "failureReason", message: "Fehlergrund darf nicht leer sein.", severity: "error" });
  }

  if (patch.deliveryStatus && patch.deliveryStatus !== currentStatus && !allowedDeliveryStatusTransitions[currentStatus].includes(patch.deliveryStatus)) {
    issues.push({
      field: "deliveryStatus",
      message: `Statuswechsel von ${currentStatus} nach ${patch.deliveryStatus} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  return issues;
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");

