import type {
  AbsenceComment,
  AbsenceContractImpact,
  AbsenceDailyRecord,
  AbsenceEpisode,
  AbsenceStatus,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);

const allowedStatusTransitions: Record<AbsenceStatus, AbsenceStatus[]> = {
  reported: ["acknowledged", "in_progress", "cancelled"],
  acknowledged: ["in_progress", "cancelled"],
  in_progress: ["partially_returned", "closed", "cancelled"],
  partially_returned: ["in_progress", "closed", "cancelled"],
  closed: [],
  cancelled: [],
};

export const validateAbsenceEpisode = (
  input: Pick<
    AbsenceEpisode,
    | "employeeId"
    | "primaryAbsenceType"
    | "reportedAt"
    | "startDate"
    | "firstDayOfIncapacity"
    | "expectedEndDate"
    | "actualEndDate"
    | "reasonCategory"
    | "reasonSubcategory"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.employeeId.trim()) {
    issues.push({ field: "employeeId", message: "Mitarbeitende Person ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.reportedAt)) {
    issues.push({ field: "reportedAt", message: "Meldezeitpunkt ist ungueltig.", severity: "error" });
  }

  if (!isIsoDate(input.startDate)) {
    issues.push({ field: "startDate", message: "Startdatum ist ungueltig.", severity: "error" });
  }

  if (input.firstDayOfIncapacity !== undefined && !isIsoDate(input.firstDayOfIncapacity)) {
    issues.push({
      field: "firstDayOfIncapacity",
      message: "Erster Tag der Arbeitsunfaehigkeit ist ungueltig.",
      severity: "error",
    });
  }

  if (input.primaryAbsenceType === "ktg_sickness" && !input.firstDayOfIncapacity) {
    issues.push({
      field: "firstDayOfIncapacity",
      message: "Erster Tag der Arbeitsunfaehigkeit ist fuer KTG erforderlich.",
      severity: "error",
    });
  }

  if (input.firstDayOfIncapacity && input.firstDayOfIncapacity > input.startDate) {
    issues.push({
      field: "firstDayOfIncapacity",
      message: "Erster Tag der Arbeitsunfaehigkeit darf nicht nach dem Startdatum liegen.",
      severity: "error",
    });
  }

  if (input.expectedEndDate !== undefined && !isIsoDate(input.expectedEndDate)) {
    issues.push({ field: "expectedEndDate", message: "Erwartetes Enddatum ist ungueltig.", severity: "error" });
  }

  if (input.actualEndDate !== undefined && !isIsoDate(input.actualEndDate)) {
    issues.push({ field: "actualEndDate", message: "Tatsaechliches Enddatum ist ungueltig.", severity: "error" });
  }

  if (input.expectedEndDate && input.expectedEndDate < input.startDate) {
    issues.push({
      field: "expectedEndDate",
      message: "Erwartetes Enddatum darf nicht vor dem Startdatum liegen.",
      severity: "error",
    });
  }

  if (input.actualEndDate && input.actualEndDate < input.startDate) {
    issues.push({
      field: "actualEndDate",
      message: "Tatsaechliches Enddatum darf nicht vor dem Startdatum liegen.",
      severity: "error",
    });
  }

  if (input.reasonCategory !== undefined && !input.reasonCategory.trim()) {
    issues.push({ field: "reasonCategory", message: "Kategorie darf nicht leer sein.", severity: "error" });
  }

  if (input.reasonSubcategory !== undefined && !input.reasonSubcategory.trim()) {
    issues.push({ field: "reasonSubcategory", message: "Unterkategorie darf nicht leer sein.", severity: "error" });
  }

  return issues;
};

export const validateAbsenceContractImpact = (
  input: Pick<
    AbsenceContractImpact,
    | "employmentContractId"
    | "affectedEmploymentPercentage"
    | "employmentPercentageSnapshot"
    | "scheduledHoursPerWeekSnapshot"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.employmentContractId.trim()) {
    issues.push({ field: "employmentContractId", message: "Anstellungsreferenz ist erforderlich.", severity: "error" });
  }

  if (input.affectedEmploymentPercentage <= 0 || input.affectedEmploymentPercentage > 100) {
    issues.push({
      field: "affectedEmploymentPercentage",
      message: "Betroffener Beschaeftigungsgrad muss zwischen 0 und 100 liegen.",
      severity: "error",
    });
  }

  if (input.employmentPercentageSnapshot <= 0 || input.employmentPercentageSnapshot > 100) {
    issues.push({
      field: "employmentPercentageSnapshot",
      message: "Gespeicherter Beschaeftigungsgrad muss zwischen 0 und 100 liegen.",
      severity: "error",
    });
  }

  if (
    input.scheduledHoursPerWeekSnapshot !== undefined &&
    input.scheduledHoursPerWeekSnapshot <= 0
  ) {
    issues.push({
      field: "scheduledHoursPerWeekSnapshot",
      message: "Geplante Wochenstunden muessen groesser als 0 sein.",
      severity: "error",
    });
  }

  return issues;
};

export const validateAbsenceDailyRecord = (
  input: Pick<
    AbsenceDailyRecord,
    | "employeeId"
    | "employmentContractId"
    | "absenceDate"
    | "incapacityPercentage"
    | "partialDayPercentage"
    | "scheduledWorkMinutes"
    | "lostWorkMinutes"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.employeeId.trim()) {
    issues.push({ field: "employeeId", message: "Mitarbeitende Person ist erforderlich.", severity: "error" });
  }

  if (!input.employmentContractId.trim()) {
    issues.push({ field: "employmentContractId", message: "Anstellung ist erforderlich.", severity: "error" });
  }

  if (!isIsoDate(input.absenceDate)) {
    issues.push({ field: "absenceDate", message: "Absenzdatum ist ungueltig.", severity: "error" });
  }

  if (input.incapacityPercentage <= 0 || input.incapacityPercentage > 100) {
    issues.push({
      field: "incapacityPercentage",
      message: "Arbeitsunfaehigkeit muss zwischen 0 und 100 liegen.",
      severity: "error",
    });
  }

  if (input.partialDayPercentage <= 0 || input.partialDayPercentage > 100) {
    issues.push({
      field: "partialDayPercentage",
      message: "Teil-Tagesanteil muss zwischen 0 und 100 liegen.",
      severity: "error",
    });
  }

  if (input.scheduledWorkMinutes !== undefined && input.scheduledWorkMinutes <= 0) {
    issues.push({
      field: "scheduledWorkMinutes",
      message: "Geplante Arbeitsminuten muessen groesser als 0 sein.",
      severity: "error",
    });
  }

  if (input.lostWorkMinutes !== undefined && input.lostWorkMinutes < 0) {
    issues.push({
      field: "lostWorkMinutes",
      message: "Verlorene Arbeitsminuten duerfen nicht negativ sein.",
      severity: "error",
    });
  }

  if (
    input.scheduledWorkMinutes !== undefined &&
    input.lostWorkMinutes !== undefined &&
    input.lostWorkMinutes > input.scheduledWorkMinutes
  ) {
    issues.push({
      field: "lostWorkMinutes",
      message: "Verlorene Arbeitsminuten duerfen geplante Arbeitsminuten nicht uebersteigen.",
      severity: "error",
    });
  }

  return issues;
};

export const validateAbsenceComment = (
  input: Pick<AbsenceComment, "message">,
): ValidationIssue[] => {
  if (!input.message.trim()) {
    return [{ field: "message", message: "Kommentar darf nicht leer sein.", severity: "error" }];
  }

  return [];
};

export const validateStatusTransition = (
  fromStatus: AbsenceStatus,
  toStatus: AbsenceStatus,
): ValidationIssue[] => {
  if (fromStatus === toStatus) {
    return [{
      field: "toStatus",
      message: "Statuswechsel auf denselben Status ist nicht zulaessig.",
      severity: "error",
    }];
  }

  if (allowedStatusTransitions[fromStatus].includes(toStatus)) {
    return [];
  }

  return [{
    field: "toStatus",
    message: `Statuswechsel von ${fromStatus} nach ${toStatus} ist in Phase 1 nicht zulaessig.`,
    severity: "error",
  }];
};

export const validateNoConflictingDailyRecord = (
  existingRecords: ReadonlyArray<Pick<AbsenceDailyRecord, "id" | "coordinatedOverlapFlag">>,
  candidate: Pick<AbsenceDailyRecord, "coordinatedOverlapFlag">,
): ValidationIssue[] => {
  if (candidate.coordinatedOverlapFlag) {
    return [];
  }

  if (existingRecords.length === 0) {
    return [];
  }

  return [{
    field: "absenceDate",
    message: "Nicht-koordinierte Ueberlappung fuer Mitarbeitende Person, Anstellung und Datum erkannt.",
    severity: "error",
  }];
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");
