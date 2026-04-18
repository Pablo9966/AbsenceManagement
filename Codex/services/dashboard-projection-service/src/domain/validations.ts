import type {
  BenchmarkSnapshot,
  DashboardKpiSnapshot,
  DashboardViewConfig,
  DashboardWidgetSnapshot,
  ProjectionJob,
  ProjectionJobStatus,
  ProjectionDependencyWatermark,
  UpdateDashboardViewConfigPatch,
  UpdateProjectionDependencyWatermarkPatch,
  UpdateProjectionJobPatch,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);

const allowedProjectionJobTransitions: Record<ProjectionJobStatus, ProjectionJobStatus[]> = {
  pending: ["running", "cancelled"],
  running: ["completed", "failed"],
  failed: ["pending"],
  completed: [],
  cancelled: [],
};

export const validateDashboardKpiSnapshot = (
  input: Pick<DashboardKpiSnapshot, "kpiKey" | "valueJson" | "windowStart" | "windowEnd" | "refreshedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.kpiKey.trim()) {
    issues.push({ field: "kpiKey", message: "KPI-Key ist erforderlich.", severity: "error" });
  }

  if (Object.keys(input.valueJson).length === 0) {
    issues.push({ field: "valueJson", message: "KPI-Wert darf nicht leer sein.", severity: "error" });
  }

  if (!isIsoDate(input.windowStart)) {
    issues.push({ field: "windowStart", message: "Fensterstart ist ungueltig.", severity: "error" });
  }

  if (!isIsoDate(input.windowEnd)) {
    issues.push({ field: "windowEnd", message: "Fensterende ist ungueltig.", severity: "error" });
  }

  if (isIsoDate(input.windowStart) && isIsoDate(input.windowEnd) && input.windowEnd < input.windowStart) {
    issues.push({ field: "windowEnd", message: "Fensterende darf nicht vor Fensterstart liegen.", severity: "error" });
  }

  if (!isIsoDateTime(input.refreshedAt)) {
    issues.push({ field: "refreshedAt", message: "Refresh-Zeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateDashboardWidgetSnapshot = (
  input: Pick<DashboardWidgetSnapshot, "widgetKey" | "widgetPayload" | "windowStart" | "windowEnd" | "refreshedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.widgetKey.trim()) {
    issues.push({ field: "widgetKey", message: "Widget-Key ist erforderlich.", severity: "error" });
  }

  if (Object.keys(input.widgetPayload).length === 0) {
    issues.push({ field: "widgetPayload", message: "Widget-Payload darf nicht leer sein.", severity: "error" });
  }

  if (input.windowStart !== undefined && !isIsoDate(input.windowStart)) {
    issues.push({ field: "windowStart", message: "Fensterstart ist ungueltig.", severity: "error" });
  }

  if (input.windowEnd !== undefined && !isIsoDate(input.windowEnd)) {
    issues.push({ field: "windowEnd", message: "Fensterende ist ungueltig.", severity: "error" });
  }

  if (input.windowStart && input.windowEnd && input.windowEnd < input.windowStart) {
    issues.push({ field: "windowEnd", message: "Fensterende darf nicht vor Fensterstart liegen.", severity: "error" });
  }

  if (!isIsoDateTime(input.refreshedAt)) {
    issues.push({ field: "refreshedAt", message: "Refresh-Zeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateProjectionJob = (
  input: Pick<ProjectionJob, "scopeKey" | "requestedAt" | "startedAt" | "completedAt" | "errorMessage">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.scopeKey.trim()) {
    issues.push({ field: "scopeKey", message: "Scope-Key ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.requestedAt)) {
    issues.push({ field: "requestedAt", message: "Anforderungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.startedAt !== undefined && !isIsoDateTime(input.startedAt)) {
    issues.push({ field: "startedAt", message: "Startzeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.completedAt !== undefined && !isIsoDateTime(input.completedAt)) {
    issues.push({ field: "completedAt", message: "Abschlusszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.errorMessage !== undefined && !input.errorMessage.trim()) {
    issues.push({ field: "errorMessage", message: "Fehlermeldung darf nicht leer sein.", severity: "error" });
  }

  return issues;
};

export const validateProjectionJobPatch = (
  currentStatus: ProjectionJobStatus,
  patch: UpdateProjectionJobPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (patch.startedAt !== undefined && !isIsoDateTime(patch.startedAt)) {
    issues.push({ field: "startedAt", message: "Startzeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.completedAt !== undefined && !isIsoDateTime(patch.completedAt)) {
    issues.push({ field: "completedAt", message: "Abschlusszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.errorMessage !== undefined && !patch.errorMessage.trim()) {
    issues.push({ field: "errorMessage", message: "Fehlermeldung darf nicht leer sein.", severity: "error" });
  }

  if (patch.jobStatus && patch.jobStatus !== currentStatus && !allowedProjectionJobTransitions[currentStatus].includes(patch.jobStatus)) {
    issues.push({
      field: "jobStatus",
      message: `Statuswechsel von ${currentStatus} nach ${patch.jobStatus} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  return issues;
};

export const validateProjectionDependencyWatermark = (
  input: Pick<ProjectionDependencyWatermark, "sourceStream" | "lastProcessedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.sourceStream.trim()) {
    issues.push({ field: "sourceStream", message: "Source-Stream ist erforderlich.", severity: "error" });
  }

  if (input.lastProcessedAt !== undefined && !isIsoDateTime(input.lastProcessedAt)) {
    issues.push({ field: "lastProcessedAt", message: "Zeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateProjectionDependencyWatermarkPatch = (
  patch: UpdateProjectionDependencyWatermarkPatch,
): ValidationIssue[] => {
  if (patch.lastProcessedAt !== undefined && !isIsoDateTime(patch.lastProcessedAt)) {
    return [{ field: "lastProcessedAt", message: "Zeitpunkt ist ungueltig.", severity: "error" }];
  }

  return [];
};

export const validateDashboardViewConfig = (
  input: Pick<DashboardViewConfig, "widgetKey" | "displayOrder">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.widgetKey.trim()) {
    issues.push({ field: "widgetKey", message: "Widget-Key ist erforderlich.", severity: "error" });
  }

  if (input.displayOrder < 0) {
    issues.push({ field: "displayOrder", message: "Display-Order darf nicht negativ sein.", severity: "error" });
  }

  return issues;
};

export const validateDashboardViewConfigPatch = (
  patch: UpdateDashboardViewConfigPatch,
): ValidationIssue[] => {
  if (patch.displayOrder !== undefined && patch.displayOrder < 0) {
    return [{ field: "displayOrder", message: "Display-Order darf nicht negativ sein.", severity: "error" }];
  }

  return [];
};

export const validateBenchmarkSnapshot = (
  input: Pick<BenchmarkSnapshot, "metricKey" | "valueJson" | "methodologyVersion" | "refreshedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.metricKey.trim()) {
    issues.push({ field: "metricKey", message: "Metrik-Key ist erforderlich.", severity: "error" });
  }

  if (Object.keys(input.valueJson).length === 0) {
    issues.push({ field: "valueJson", message: "Benchmark-Wert darf nicht leer sein.", severity: "error" });
  }

  if (!input.methodologyVersion.trim()) {
    issues.push({ field: "methodologyVersion", message: "Methodikversion ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.refreshedAt)) {
    issues.push({ field: "refreshedAt", message: "Refresh-Zeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");

