import type { CoverageEligibility, Employee, EmploymentContract, SalaryRecord, UpdateEmployeePatch } from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

const isValidAhv = (value: string): boolean => /^756\.\d{4}\.\d{4}\.\d{2}$/.test(value);

const isProbablyEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const validateEmployee = (
  input: Pick<Employee, "personnelNumber" | "firstName" | "lastName" | "dateOfBirth"> & {
    ahvNumber?: string;
  },
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.personnelNumber.trim()) {
    issues.push({ field: "personnelNumber", message: "Personalnummer ist erforderlich.", severity: "error" });
  }

  if (!input.firstName.trim()) {
    issues.push({ field: "firstName", message: "Vorname ist erforderlich.", severity: "error" });
  }

  if (!input.lastName.trim()) {
    issues.push({ field: "lastName", message: "Nachname ist erforderlich.", severity: "error" });
  }

  if (!isIsoDate(input.dateOfBirth)) {
    issues.push({ field: "dateOfBirth", message: "Geburtsdatum muss ISO-Format YYYY-MM-DD haben.", severity: "error" });
  }

  if (input.ahvNumber && !isValidAhv(input.ahvNumber)) {
    issues.push({ field: "ahvNumber", message: "AHV-Nummer muss Format 756.1234.5678.90 haben.", severity: "error" });
  }

  return issues;
};

export const validateEmploymentContract = (
  input: Pick<EmploymentContract, "startDate" | "endDate" | "employmentPercentage" | "weeklyHours">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!isIsoDate(input.startDate)) {
    issues.push({ field: "startDate", message: "Startdatum ist ungueltig.", severity: "error" });
  }

  if (input.endDate && !isIsoDate(input.endDate)) {
    issues.push({ field: "endDate", message: "Enddatum ist ungueltig.", severity: "error" });
  }

  if (input.endDate && input.endDate < input.startDate) {
    issues.push({
      field: "endDate",
      message: "Enddatum darf nicht vor dem Startdatum liegen.",
      severity: "error",
    });
  }

  if (input.employmentPercentage <= 0) {
    issues.push({
      field: "employmentPercentage",
      message: "Beschaeftigungsgrad muss groesser als 0 sein.",
      severity: "error",
    });
  }

  if (input.employmentPercentage > 100) {
    issues.push({
      field: "employmentPercentage",
      message: "Beschaeftigungsgrad pro Vertrag darf 100% nicht ueberschreiten.",
      severity: "error",
    });
  }

  if (input.weeklyHours !== undefined && input.weeklyHours <= 0) {
    issues.push({ field: "weeklyHours", message: "Wochenstunden muessen groesser als 0 sein.", severity: "error" });
  }

  return issues;
};

export const validateSalaryRecord = (
  input: Pick<
    SalaryRecord,
    | "validFrom"
    | "validTo"
    | "salaryModel"
    | "baseSalaryAmount"
    | "currency"
    | "bonusTargetAmount"
    | "allowancesAmount"
    | "fteReferencePercentage"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!isIsoDate(input.validFrom)) {
    issues.push({ field: "validFrom", message: "Gueltig-ab-Datum ist ungueltig.", severity: "error" });
  }

  if (input.validTo && !isIsoDate(input.validTo)) {
    issues.push({ field: "validTo", message: "Gueltig-bis-Datum ist ungueltig.", severity: "error" });
  }

  if (input.validTo && input.validTo < input.validFrom) {
    issues.push({ field: "validTo", message: "Gueltig-bis darf nicht vor Gueltig-ab liegen.", severity: "error" });
  }

  if (input.baseSalaryAmount < 0) {
    issues.push({ field: "baseSalaryAmount", message: "Basissalaer darf nicht negativ sein.", severity: "error" });
  }

  if (input.currency !== "CHF") {
    issues.push({ field: "currency", message: "Phase 1 unterstuetzt nur CHF.", severity: "error" });
  }

  if (input.bonusTargetAmount < 0) {
    issues.push({ field: "bonusTargetAmount", message: "Bonus darf nicht negativ sein.", severity: "error" });
  }

  if (input.allowancesAmount < 0) {
    issues.push({ field: "allowancesAmount", message: "Zulagen duerfen nicht negativ sein.", severity: "error" });
  }

  if (input.fteReferencePercentage <= 0) {
    issues.push({
      field: "fteReferencePercentage",
      message: "FTE-Referenz muss groesser als 0 sein.",
      severity: "error",
    });
  }

  if (input.fteReferencePercentage > 100) {
    issues.push({
      field: "fteReferencePercentage",
      message: "FTE-Referenz darf 100% nicht ueberschreiten.",
      severity: "error",
    });
  }

  return issues;
};

export const validateCoverageEligibility = (
  input: Pick<CoverageEligibility, "insuredFrom" | "insuredTo" | "salaryBasisRuleVersion">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!isIsoDate(input.insuredFrom)) {
    issues.push({ field: "insuredFrom", message: "Versichert-ab-Datum ist ungueltig.", severity: "error" });
  }

  if (input.insuredTo && !isIsoDate(input.insuredTo)) {
    issues.push({ field: "insuredTo", message: "Versichert-bis-Datum ist ungueltig.", severity: "error" });
  }

  if (input.insuredTo && input.insuredTo < input.insuredFrom) {
    issues.push({ field: "insuredTo", message: "Versichert-bis darf nicht vor Versichert-ab liegen.", severity: "error" });
  }

  if (!input.salaryBasisRuleVersion.trim()) {
    issues.push({
      field: "salaryBasisRuleVersion",
      message: "Version der versicherten Salaerregel ist erforderlich.",
      severity: "error",
    });
  }

  return issues;
};

export const validateEmployeePatch = (input: UpdateEmployeePatch): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (input.preferredName !== undefined && !input.preferredName.trim()) {
    issues.push({
      field: "preferredName",
      message: "Bevorzugter Name darf nicht leer sein.",
      severity: "error",
    });
  }

  if (input.workEmail !== undefined && input.workEmail.trim() && !isProbablyEmail(input.workEmail)) {
    issues.push({
      field: "workEmail",
      message: "Geschaeftliche E-Mail ist ungueltig.",
      severity: "error",
    });
  }

  if (input.privateEmail !== undefined && input.privateEmail.trim() && !isProbablyEmail(input.privateEmail)) {
    issues.push({
      field: "privateEmail",
      message: "Private E-Mail ist ungueltig.",
      severity: "error",
    });
  }

  return issues;
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");

export interface EffectiveDatedRange {
  id: string;
  validFrom: string;
  validTo?: string;
}

const overlaps = (left: EffectiveDatedRange, right: EffectiveDatedRange): boolean => {
  const leftEnd = left.validTo ?? "9999-12-31";
  const rightEnd = right.validTo ?? "9999-12-31";

  return left.validFrom <= rightEnd && right.validFrom <= leftEnd;
};

export const validateNoOverlappingRanges = (
  ranges: ReadonlyArray<EffectiveDatedRange>,
  candidate: EffectiveDatedRange,
  fieldPrefix: string,
): ValidationIssue[] => {
  const conflict = ranges.find((existing) => existing.id !== candidate.id && overlaps(existing, candidate));

  if (!conflict) {
    return [];
  }

  return [
    {
      field: `${fieldPrefix}.validFrom`,
      message: `Zeitraum ueberschneidet sich mit Datensatz ${conflict.id}.`,
      severity: "error",
    },
  ];
};
