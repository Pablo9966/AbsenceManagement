import type {
  BenefitAdjustment,
  BenefitCaseCalculation,
  BenefitDayBreakdown,
  BenefitEntitlementPeriod,
  CalculationStatus,
  CoordinationWindow,
  InsuredSalarySnapshot,
  PaymentInstruction,
  TaggelddispositivSnapshot,
  UpdateBenefitCaseCalculationPatch,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);

const isTerminalOrImmutable = (status: CalculationStatus): boolean =>
  status === "calculated" || status === "superseded" || status === "approved_for_payment";

export const validateBenefitCaseCalculation = (
  input: Pick<
    BenefitCaseCalculation,
    "ktgCaseId" | "referenceDate" | "coverageSnapshotId" | "benefitDaysConsumed" | "benefitDaysRemaining" | "maxBenefitDays" | "waitingDaysConsumed" | "createdAt" | "updatedAt"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.ktgCaseId.trim()) {
    issues.push({ field: "ktgCaseId", message: "KTG-Fallreferenz ist erforderlich.", severity: "error" });
  }
  if (!input.coverageSnapshotId.trim()) {
    issues.push({ field: "coverageSnapshotId", message: "Deckungssnapshot ist erforderlich.", severity: "error" });
  }
  if (!isIsoDate(input.referenceDate)) {
    issues.push({ field: "referenceDate", message: "Referenzdatum ist ungueltig.", severity: "error" });
  }
  if (!isIsoDateTime(input.createdAt) || !isIsoDateTime(input.updatedAt)) {
    issues.push({ field: "timestamps", message: "Zeitstempel sind ungueltig.", severity: "error" });
  }
  if (input.benefitDaysConsumed < 0 || input.benefitDaysRemaining < 0 || input.maxBenefitDays < 0 || input.waitingDaysConsumed < 0) {
    issues.push({ field: "dayCounters", message: "Leistungstage duerfen nicht negativ sein.", severity: "error" });
  }

  return issues;
};

export const validateBenefitCaseCalculationPatch = (
  currentStatus: CalculationStatus,
  patch: UpdateBenefitCaseCalculationPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (isTerminalOrImmutable(currentStatus)) {
    issues.push({
      field: "calculationStatus",
      message: "Berechnungen in Status calculated, superseded oder approved_for_payment duerfen nicht mehr in-place geaendert werden.",
      severity: "error",
    });
  }
  if (patch.updatedAt !== undefined && !isIsoDateTime(patch.updatedAt)) {
    issues.push({ field: "updatedAt", message: "Aktualisierungszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateInsuredSalarySnapshot = (input: InsuredSalarySnapshot): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isIsoDate(input.salaryBasisDate)) {
    issues.push({ field: "salaryBasisDate", message: "Stichtag fuer versicherten Lohn ist ungueltig.", severity: "error" });
  }
  if (input.employmentPercentage < 0 || input.employmentPercentage > 100) {
    issues.push({ field: "employmentPercentage", message: "Beschaeftigungsgrad muss zwischen 0 und 100 liegen.", severity: "error" });
  }
  if (!input.formula.trim()) {
    issues.push({ field: "formula", message: "Formel ist fuer Transparenz erforderlich.", severity: "error" });
  }
  return issues;
};

export const validateCoordinationWindow = (input: CoordinationWindow): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isIsoDate(input.windowStart) || !isIsoDate(input.windowEnd)) {
    issues.push({ field: "windowDates", message: "Koordinationsfenster hat ungueltige Daten.", severity: "error" });
  }
  if (input.windowEnd < input.windowStart) {
    issues.push({ field: "windowEnd", message: "Fensterende darf nicht vor Fensterbeginn liegen.", severity: "error" });
  }
  if (!input.legalBasis.trim() || !input.sourceMethod.trim() || !input.formula.trim()) {
    issues.push({ field: "transparency", message: "Rechtsgrundlage, Herleitung und Formel sind erforderlich.", severity: "error" });
  }
  return issues;
};

export const validateBenefitEntitlementPeriod = (input: BenefitEntitlementPeriod): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isIsoDate(input.periodStart) || !isIsoDate(input.periodEnd)) {
    issues.push({ field: "periodDates", message: "Leistungsperiode hat ungueltige Daten.", severity: "error" });
  }
  if (input.periodEnd < input.periodStart) {
    issues.push({ field: "periodEnd", message: "Periodenende darf nicht vor Periodenbeginn liegen.", severity: "error" });
  }
  if (input.incapacityPercentage < 0 || input.incapacityPercentage > 100) {
    issues.push({ field: "incapacityPercentage", message: "Arbeitsunfaehigkeit muss zwischen 0 und 100 liegen.", severity: "error" });
  }
  if (!input.formula.trim()) {
    issues.push({ field: "formula", message: "Formel ist fuer Leistungsperioden erforderlich.", severity: "error" });
  }
  return issues;
};

export const validateBenefitDayBreakdown = (input: BenefitDayBreakdown): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isIsoDate(input.benefitDate)) {
    issues.push({ field: "benefitDate", message: "Leistungstag ist ungueltig.", severity: "error" });
  }
  if (input.incapacityPercentage < 0 || input.incapacityPercentage > 100) {
    issues.push({ field: "incapacityPercentage", message: "Arbeitsunfaehigkeit muss zwischen 0 und 100 liegen.", severity: "error" });
  }
  if (input.coveragePercentage < 0 || input.coveragePercentage > 100) {
    issues.push({ field: "coveragePercentage", message: "Deckungsprozentsatz muss zwischen 0 und 100 liegen.", severity: "error" });
  }
  return issues;
};

export const validateBenefitAdjustment = (input: BenefitAdjustment): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isIsoDate(input.effectiveFrom) || !isIsoDate(input.effectiveTo)) {
    issues.push({ field: "effectiveWindow", message: "Korrekturfenster ist ungueltig.", severity: "error" });
  }
  if (input.effectiveTo < input.effectiveFrom) {
    issues.push({ field: "effectiveTo", message: "Korrekturfenster ist ungueltig.", severity: "error" });
  }
  if (!input.reasonCode.trim() || !input.formula.trim()) {
    issues.push({ field: "reasonCode", message: "Grundcode und Formel sind erforderlich.", severity: "error" });
  }
  return issues;
};

export const validatePaymentInstruction = (input: PaymentInstruction): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.payeeReference.trim()) {
    issues.push({ field: "payeeReference", message: "Empfaengerreferenz ist erforderlich.", severity: "error" });
  }
  if (!input.routingFormula.trim()) {
    issues.push({ field: "routingFormula", message: "Routing-Formel ist erforderlich.", severity: "error" });
  }
  if (!isIsoDate(input.paymentPeriodStart) || !isIsoDate(input.paymentPeriodEnd)) {
    issues.push({ field: "paymentPeriod", message: "Auszahlungsperiode ist ungueltig.", severity: "error" });
  }
  if (input.paymentPeriodEnd < input.paymentPeriodStart) {
    issues.push({ field: "paymentPeriodEnd", message: "Periodenende darf nicht vor Periodenbeginn liegen.", severity: "error" });
  }
  return issues;
};

export const validateTaggelddispositivSnapshot = (input: TaggelddispositivSnapshot): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isIsoDate(input.statementPeriodStart) || !isIsoDate(input.statementPeriodEnd)) {
    issues.push({ field: "statementPeriod", message: "Dispositiv-Periode ist ungueltig.", severity: "error" });
  }
  if (input.statementPeriodEnd < input.statementPeriodStart) {
    issues.push({ field: "statementPeriodEnd", message: "Dispositiv-Periode ist ungueltig.", severity: "error" });
  }
  if (!isIsoDateTime(input.generatedAt)) {
    issues.push({ field: "generatedAt", message: "Generierungszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");

