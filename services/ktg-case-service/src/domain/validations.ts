import type {
  KtgCase,
  KtgCaseAbsenceLink,
  KtgCaseCoverageSnapshot,
  KtgCaseDecision,
  KtgCaseNote,
  KtgCaseStatus,
  KtgCaseSubmission,
  KtgDeadline,
  KtgTask,
  UpdateKtgCasePatch,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);

const allowedStatusTransitions: Record<KtgCaseStatus, KtgCaseStatus[]> = {
  suggested: ["draft", "submitted", "rejected"],
  draft: ["submitted", "rejected"],
  submitted: ["in_review", "rejected"],
  in_review: ["benefit_active", "rejected"],
  benefit_active: ["closed"],
  closed: [],
  rejected: [],
};

export const validateKtgCase = (
  input: Pick<KtgCase, "caseNumber" | "employeeId" | "policyId" | "status">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.caseNumber.trim()) {
    issues.push({ field: "caseNumber", message: "Fallnummer ist erforderlich.", severity: "error" });
  }

  if (!input.employeeId.trim()) {
    issues.push({ field: "employeeId", message: "Mitarbeitende Person ist erforderlich.", severity: "error" });
  }

  if (!input.policyId.trim()) {
    issues.push({ field: "policyId", message: "Police ist erforderlich.", severity: "error" });
  }

  if (!allowedStatusTransitions[input.status] && input.status !== "closed" && input.status !== "rejected") {
    issues.push({ field: "status", message: "KTG-Fallstatus ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateKtgCasePatch = (input: UpdateKtgCasePatch): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (input.benefitStartDate !== undefined && !isIsoDate(input.benefitStartDate)) {
    issues.push({ field: "benefitStartDate", message: "Leistungsbeginn ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateKtgCaseAbsenceLink = (
  input: Pick<KtgCaseAbsenceLink, "absenceEpisodeId" | "linkedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.absenceEpisodeId.trim()) {
    issues.push({ field: "absenceEpisodeId", message: "Absenzreferenz ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.linkedAt)) {
    issues.push({ field: "linkedAt", message: "Verknuepfungszeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateKtgCaseCoverageSnapshot = (
  input: Pick<
    KtgCaseCoverageSnapshot,
    | "policyId"
    | "coveragePercentage"
    | "wartezeitDays"
    | "leistungsdauerDays"
    | "lohnfortzahlungDays"
    | "salaryFormulaVersion"
    | "firstDayOfIncapacity"
    | "capturedAt"
    | "insuredSalaryAmountChf"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.policyId.trim()) {
    issues.push({ field: "policyId", message: "Police ist erforderlich.", severity: "error" });
  }

  if (input.coveragePercentage <= 0 || input.coveragePercentage > 100) {
    issues.push({ field: "coveragePercentage", message: "Deckungsgrad muss zwischen 0 und 100 liegen.", severity: "error" });
  }

  if (input.wartezeitDays < 0) {
    issues.push({ field: "wartezeitDays", message: "Wartezeit darf nicht negativ sein.", severity: "error" });
  }

  if (input.leistungsdauerDays <= 0) {
    issues.push({ field: "leistungsdauerDays", message: "Leistungsdauer muss groesser als 0 sein.", severity: "error" });
  }

  if (input.lohnfortzahlungDays < 0) {
    issues.push({ field: "lohnfortzahlungDays", message: "Lohnfortzahlungstage duerfen nicht negativ sein.", severity: "error" });
  }

  if (!input.salaryFormulaVersion.trim()) {
    issues.push({ field: "salaryFormulaVersion", message: "Version der Salaerformel ist erforderlich.", severity: "error" });
  }

  if (!isIsoDate(input.firstDayOfIncapacity)) {
    issues.push({ field: "firstDayOfIncapacity", message: "Erster Tag der Arbeitsunfaehigkeit ist ungueltig.", severity: "error" });
  }

  if (!isIsoDateTime(input.capturedAt)) {
    issues.push({ field: "capturedAt", message: "Snapshot-Zeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.insuredSalaryAmountChf !== undefined && input.insuredSalaryAmountChf < 0) {
    issues.push({ field: "insuredSalaryAmountChf", message: "Versichertes Salaer darf nicht negativ sein.", severity: "error" });
  }

  return issues;
};

export const validateKtgDeadline = (
  input: Pick<KtgDeadline, "dueAt">,
): ValidationIssue[] => {
  if (!isIsoDateTime(input.dueAt)) {
    return [{ field: "dueAt", message: "Fristdatum ist ungueltig.", severity: "error" }];
  }

  return [];
};

export const validateKtgTask = (
  input: Pick<KtgTask, "dueAt" | "completedAt" | "description">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (input.dueAt !== undefined && !isIsoDateTime(input.dueAt)) {
    issues.push({ field: "dueAt", message: "Task-Faelligkeit ist ungueltig.", severity: "error" });
  }

  if (input.completedAt !== undefined && !isIsoDateTime(input.completedAt)) {
    issues.push({ field: "completedAt", message: "Task-Abschlussdatum ist ungueltig.", severity: "error" });
  }

  if (input.description !== undefined && !input.description.trim()) {
    issues.push({ field: "description", message: "Beschreibung darf nicht leer sein.", severity: "error" });
  }

  return issues;
};

export const validateKtgCaseNote = (
  input: Pick<KtgCaseNote, "message">,
): ValidationIssue[] => {
  if (!input.message.trim()) {
    return [{ field: "message", message: "Notiz darf nicht leer sein.", severity: "error" }];
  }

  return [];
};

export const validateKtgCaseDecision = (
  input: Pick<KtgCaseDecision, "decisionStatus" | "effectiveFrom" | "effectiveTo" | "decisionAt" | "dailyAllowanceAmountChf">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!isIsoDateTime(input.decisionAt)) {
    issues.push({ field: "decisionAt", message: "Entscheidzeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.effectiveFrom !== undefined && !isIsoDate(input.effectiveFrom)) {
    issues.push({ field: "effectiveFrom", message: "Gueltig-ab ist ungueltig.", severity: "error" });
  }

  if (input.effectiveTo !== undefined && !isIsoDate(input.effectiveTo)) {
    issues.push({ field: "effectiveTo", message: "Gueltig-bis ist ungueltig.", severity: "error" });
  }

  if (input.effectiveFrom && input.effectiveTo && input.effectiveTo < input.effectiveFrom) {
    issues.push({ field: "effectiveTo", message: "Gueltig-bis darf nicht vor Gueltig-ab liegen.", severity: "error" });
  }

  if (input.dailyAllowanceAmountChf < 0) {
    issues.push({ field: "dailyAllowanceAmountChf", message: "Taggeldbetrag darf nicht negativ sein.", severity: "error" });
  }

  if (input.decisionStatus === "rejected" && input.dailyAllowanceAmountChf > 0) {
    issues.push({ field: "dailyAllowanceAmountChf", message: "Abgelehnter Entscheid darf kein positives Taggeld tragen.", severity: "warning" });
  }

  return issues;
};

export const validateKtgCaseSubmission = (
  input: Pick<KtgCaseSubmission, "submittedAt" | "payloadSnapshot">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!isIsoDateTime(input.submittedAt)) {
    issues.push({ field: "submittedAt", message: "Einreichungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (Object.keys(input.payloadSnapshot).length === 0) {
    issues.push({ field: "payloadSnapshot", message: "Einreichungspayload darf nicht leer sein.", severity: "error" });
  }

  return issues;
};

export const validateKtgCaseStatusTransition = (
  fromStatus: KtgCaseStatus,
  toStatus: KtgCaseStatus,
): ValidationIssue[] => {
  if (fromStatus === toStatus) {
    return [{ field: "toStatus", message: "Statuswechsel auf denselben Status ist nicht zulaessig.", severity: "error" }];
  }

  if (allowedStatusTransitions[fromStatus].includes(toStatus)) {
    return [];
  }

  return [{
    field: "toStatus",
    message: `Statuswechsel von ${fromStatus} nach ${toStatus} ist nicht zulaessig.`,
    severity: "error",
  }];
};

export const validateSingleOriginatingEpisode = (
  existingLinks: ReadonlyArray<Pick<KtgCaseAbsenceLink, "id" | "isOriginatingEpisode">>,
  candidate: Pick<KtgCaseAbsenceLink, "isOriginatingEpisode">,
): ValidationIssue[] => {
  if (!candidate.isOriginatingEpisode) {
    return [];
  }

  if (!existingLinks.some((link) => link.isOriginatingEpisode)) {
    return [];
  }

  return [{
    field: "isOriginatingEpisode",
    message: "Es darf nur eine urspruengliche Absenz pro KTG-Fall geben.",
    severity: "error",
  }];
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");
